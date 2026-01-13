import { Task, TaskDocument } from '../models/Task';
import { TaskStatus, ITask, IImage } from '../types';
import { generateRandomPrice } from '../utils/priceUtils';
import { processImage } from './imageProcessingService';

/**
 * Create a new task
 */
export async function createTask(imagePath: string): Promise<TaskDocument> {
  const price = generateRandomPrice(5, 50);

  const task = new Task({
    status: 'pending',
    price,
    originalPath: imagePath,
    images: [],
  });

  await task.save();
  return task;
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string): Promise<TaskDocument | null> {
  try {
    const task = await Task.findById(taskId);
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
): Promise<TaskDocument | null> {
  const updateData: Partial<ITask> = {
    status,
    updatedAt: new Date(),
  };

  if (error) {
    updateData.error = error;
  }

  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
  return task;
}

/**
 * Update task with processed images
 */
export async function updateTaskWithImages(
  taskId: string,
  images: IImage[]
): Promise<TaskDocument | null> {
  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      status: 'completed',
      images,
      updatedAt: new Date(),
    },
    { new: true }
  );
  return task;
}

/**
 * Process task asynchronously
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

    // Process image
    const result = await processImage(task.originalPath);

    // Update task with processed images
    await updateTaskWithImages(taskId, result.images);
  } catch (error) {
    // Update task status to failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateTaskStatus(taskId, 'failed', errorMessage);
    throw error;
  }
}

