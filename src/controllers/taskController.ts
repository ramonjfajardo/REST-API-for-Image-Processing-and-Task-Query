import { Request, Response, NextFunction } from 'express';
import { createTask, getTaskById } from '../services/taskService';
import { processTaskInBackground } from '../services/taskProcessor';
import { CustomError } from '../middleware/errorHandler';
import { TaskResponse, ImageResponse } from '../types';

/**
 * Create a new image processing task
 * POST /tasks
 */
export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { imagePath } = req.body;

    // Create task
    const task = await createTask(imagePath);

    // Start processing in background (non-blocking)
    processTaskInBackground(task._id.toString());

    // Return immediate response
    const response: TaskResponse = {
      taskId: task._id.toString(),
      status: task.status,
      price: task.price,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get task by ID
 * GET /tasks/:taskId
 */
export async function getTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { taskId } = req.params;

    const task = await getTaskById(taskId);

    if (!task) {
      throw new CustomError(`Task with ID ${taskId} not found`, 404);
    }

    const response: TaskResponse = {
      taskId: task._id.toString(),
      status: task.status,
      price: task.price,
    };

    // Include images if task is completed
    if (task.status === 'completed' && task.images && task.images.length > 0) {
      response.images = task.images.map(
        (img): ImageResponse => ({
          resolution: img.resolution,
          path: img.path,
        })
      );
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

