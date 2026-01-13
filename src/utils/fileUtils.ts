import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';

const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';
const INPUT_DIR = process.env.INPUT_DIR || './input';

/**
 * Calculate MD5 hash of a file
 */
export async function calculateMD5(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * Calculate MD5 hash of a buffer
 */
export function calculateMD5FromBuffer(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Extract file extension from path
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Extract filename without extension from path
 */
export function getFileNameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a URL
 */
export function isURL(pathOrUrl: string): boolean {
  try {
    const url = new URL(pathOrUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Download file from URL to temporary location
 */
export async function downloadFile(url: string, tempPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout: 30000,
  });

  const writer = fsSync.createWriteStream(tempPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Get output directory path for an image
 */
export function getOutputPath(originalName: string, resolution: string): string {
  return path.join(OUTPUT_DIR, originalName, resolution);
}

/**
 * Get full file path for processed image
 */
export function getProcessedImagePath(
  originalName: string,
  resolution: string,
  md5: string,
  extension: string
): string {
  const fileName = `${md5}${extension}`;
  return path.join(OUTPUT_DIR, originalName, resolution, fileName);
}

/**
 * Get relative path for API response (e.g., /output/image1/1024/abc123.jpg)
 */
export function getRelativePath(fullPath: string): string {
  const normalizedPath = path.normalize(fullPath);
  // Convert backslashes to forward slashes for API responses
  return normalizedPath.replace(/\\/g, '/');
}

export { OUTPUT_DIR, INPUT_DIR };

