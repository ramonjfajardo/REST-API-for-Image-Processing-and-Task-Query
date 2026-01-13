import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
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

const RESOLUTIONS = ['1024', '800'] as const;

export interface ProcessImageResult {
  images: IImage[];
}

/**
 * Process an image and create variants at specified resolutions
 */
export async function processImage(
  imagePathOrUrl: string
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

      // Save processed image
      await fs.writeFile(outputPath, resizedBuffer);

      // Create image record
      const imageRecord: IImage = {
        resolution,
        path: getRelativePath(outputPath),
        md5,
        createdAt: new Date(),
      };

      processedImages.push(imageRecord);
    }

    return { images: processedImages };
  } catch (error) {
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up temporary file if it was downloaded
    if (isTempFile && (await fileExists(localImagePath))) {
      try {
        await fs.unlink(localImagePath);
      } catch (error) {
        console.error('Failed to delete temporary file:', error);
      }
    }
  }
}

