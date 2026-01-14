import mongoose from 'mongoose';
import { taskRepository } from '../adapters/mongoose/TaskRepository';
import { imageRepository } from '../adapters/mongoose/ImageRepository';
import { TaskStatus } from '../types';
import { generateRandomPrice } from '../utils/priceUtils';
import { processImage } from './imageProcessingService';
import { logger } from '../utils/logger';

/**
 * Create a new task
 */
export async function createTask(imagePath: string): Promise<any> {
  const price = generateRandomPrice(5, 50);

  const task = await taskRepository.create({
    status: 'pending',
    price,
    originalPath: imagePath,
    images: [],
  });

  return task;
}

/**
 * Get task by ID with populated images
 */
export async function getTaskById(taskId: string): Promise<any | null> {
  try {
    const task = await taskRepository.findById(taskId, true);
    return task;
  } catch (error) {
    return null;
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  error?: string
): Promise<any | null> {
  const task = await taskRepository.updateStatus(taskId, status, error);
  return task;
}

/**
 * Update task with processed image IDs
 */
export async function updateTaskWithImages(
  taskId: string,
  imageIds: mongoose.Types.ObjectId[],
  session?: any
): Promise<any | null> {
  const task = await taskRepository.updateWithImages(taskId, imageIds, session);
  return task;
}

/**
 * Check if MongoDB supports transactions (requires replica set or sharded cluster)
 * Caches the result to avoid repeated checks
 */
let transactionSupportCache: boolean | null = null;

async function supportsTransactions(): Promise<boolean> {
  // Return cached result if available
  if (transactionSupportCache !== null) {
    return transactionSupportCache;
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      transactionSupportCache = false;
      return false;
    }

    const admin = db.admin();
    const serverStatus = await admin.serverStatus();
    
    // Check if it's a replica set or mongos
    const supports = (
      (serverStatus.repl !== undefined && serverStatus.repl.setName) ||
      serverStatus.process === 'mongos'
    );
    
    transactionSupportCache = supports;
    return supports;
  } catch (error) {
    // If we can't determine, assume no transactions (safer for standalone)
    logger.warn('[TaskService] Could not determine transaction support, assuming standalone MongoDB:', error);
    transactionSupportCache = false;
    return false;
  }
}

/**
 * Process task asynchronously
 * Uses MongoDB transactions if available, otherwise falls back to sequential operations
 * Maintains data consistency between tasks and images collections
 */
export async function processTask(taskId: string): Promise<void> {
  try {
    // Update status to processing
    await updateTaskStatus(taskId, 'processing');

    // Get task
    const task = await getTaskById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Try to use transactions if supported, otherwise use sequential operations
    const useTransactions = await supportsTransactions();
    let useSequential = !useTransactions;

    if (useTransactions) {
      // Try to use transactions for atomic updates (replica set or sharded cluster)
      try {
        logger.info(`[TaskService] Using MongoDB transactions for task ${taskId}`);
        const session = await taskRepository.startSession();
        session.startTransaction();

        try {
          // Process image and save to Image collection (within transaction)
          const result = await processImage(task.originalPath, task._id, session);

          // Update task with processed image IDs in transaction via repository
          await taskRepository.updateWithImages(taskId, result.imageIds, session);

          // Commit transaction to ensure both collections are updated atomically
          await session.commitTransaction();
          await session.endSession();
          return; // Success, exit early
        } catch (transactionError) {
          // Rollback transaction on error
          try {
            await session.abortTransaction();
          } catch {
            // Ignore abort errors
          }
          await session.endSession();
          throw transactionError;
        }
      } catch (transactionError: any) {
        // If transaction fails due to replica set requirement, fall back to sequential
        if (
          transactionError?.message?.includes('Transaction numbers are only allowed') ||
          transactionError?.message?.includes('not a replica set')
        ) {
          logger.warn(
            `[TaskService] Transaction not supported, falling back to sequential operations for task ${taskId}`
          );
          // Reset cache and use sequential operations
          transactionSupportCache = false;
          useSequential = true;
        } else {
          // Other transaction errors should be thrown
          throw transactionError;
        }
      }
    }

    // Sequential operations (standalone MongoDB or transaction fallback)
    if (useSequential) {
      logger.info(`[TaskService] Using sequential operations (standalone MongoDB) for task ${taskId}`);
      const imageIds: mongoose.Types.ObjectId[] = [];
      try {
        // Process image and save to Image collection
        const result = await processImage(task.originalPath, task._id);

        // Store image IDs for potential cleanup
        imageIds.push(...result.imageIds);

        // Update task with processed image IDs via repository
        await taskRepository.updateWithImages(taskId, result.imageIds);
      } catch (processingError) {
        // Cleanup: delete any images that were created if task update fails
        if (imageIds.length > 0) {
          try {
            await imageRepository.deleteManyByIds(imageIds);
          } catch (cleanupError) {
            logger.error('Error cleaning up images:', cleanupError);
          }
        }
        throw processingError;
      }
    }
  } catch (error) {
    // Update task status to failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateTaskStatus(taskId, 'failed', errorMessage);
    throw error;
  }
}

