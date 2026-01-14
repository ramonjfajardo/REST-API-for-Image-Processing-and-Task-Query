import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import mongoose from 'mongoose';
import {
  ensureDirectoryExists,
  calculateMD5FromBuffer,
  getFileExtension,
  getFileNameWithoutExtension,
  getProcessedImagePath,
  getRelativePath,
  isURL,
  downloadFile,
  fileExists,
  OUTPUT_DIR,
} from '../utils/fileUtils';
import { IImage } from '../types';
import { imageRepository } from '../adapters/mongoose/ImageRepository';

const RESOLUTIONS = ['1024', '800'] as const;

export interface ProcessImageResult {
  imageIds: mongoose.Types.ObjectId[];
  images: IImage[];
}

/**
 * Process an image and create variants at specified resolutions
 * Saves images to the Image collection in MongoDB
 * @param imagePathOrUrl - Path or URL to the image
 * @param taskId - Task ID to associate images with
 * @param session - Optional MongoDB session for transactions
 */
export async function processImage(
  imagePathOrUrl: string,
  taskId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession
): Promise<ProcessImageResult> {
  let localImagePath: string = imagePathOrUrl;
  let isTempFile = false;

  try {
    // Handle URL downloads
    if (isURL(imagePathOrUrl)) {
      const tempDir = path.join(process.cwd(), 'temp');
      await ensureDirectoryExists(tempDir);
      const tempFileName = `temp_${Date.now()}${path.extname(new URL(imagePathOrUrl).pathname)}`;
      localImagePath = path.join(tempDir, tempFileName);
      await downloadFile(imagePathOrUrl, localImagePath);
      isTempFile = true;
    }

    // Validate file exists
    if (!(await fileExists(localImagePath))) {
      throw new Error(`Image file not found: ${localImagePath}`);
    }

    // Read image metadata
    const metadata = await sharp(localImagePath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: unable to read dimensions');
    }

    // Get original image info
    const originalExtension = getFileExtension(localImagePath);
    const originalName = getFileNameWithoutExtension(
      isURL(imagePathOrUrl) ? path.basename(new URL(imagePathOrUrl).pathname) : localImagePath
    );

    // Ensure output directory exists
    await ensureDirectoryExists(OUTPUT_DIR);

    const processedImages: IImage[] = [];
    const imageIds: mongoose.Types.ObjectId[] = [];

    // Process each resolution
    for (const resolution of RESOLUTIONS) {
      const resolutionNum = parseInt(resolution, 10);

      // Create output directory for this resolution
      const outputDir = path.join(OUTPUT_DIR, originalName, resolution);
      await ensureDirectoryExists(outputDir);

      // Resize image maintaining aspect ratio
      const resizedBuffer = await sharp(localImagePath)
        .resize(resolutionNum, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .toBuffer();

      // Calculate MD5 hash
      const md5 = calculateMD5FromBuffer(resizedBuffer);

      // Generate output path
      const outputPath = getProcessedImagePath(
        originalName,
        resolution,
        md5,
        originalExtension
      );

      // Save processed image to filesystem
      await fs.writeFile(outputPath, resizedBuffer);

      // Create and save image record using ImageRepository (adapter)
      const imageRecord = await imageRepository.create(
        {
          taskId,
          resolution,
          path: getRelativePath(outputPath),
          md5,
          createdAt: new Date(),
        },
        session
      );

      // Store image ID for task reference
      imageIds.push(imageRecord._id);

      // Also keep IImage format for compatibility
      processedImages.push({
        resolution,
        path: imageRecord.path,
        md5: imageRecord.md5,
        createdAt: imageRecord.createdAt,
      });
    }

    return { imageIds, images: processedImages };
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up temporary file if it was downloaded
    if (isTempFile && (await fileExists(localImagePath))) {
      try {
        await fs.unlink(localImagePath);
      } catch (error) {
        const { logger } = require('../utils/logger');
        logger.error('Failed to delete temporary file:', error);
      }
    }
  }
}

