import { processTask } from './taskService';
import { Task } from '../models/Task';

/**
 * Process a single task with enhanced error handling and logging
 */
export async function processTaskSafely(taskId: string): Promise<void> {
  const startTime = Date.now();
  console.log(`[TaskProcessor] Starting processing for task ${taskId}`);

  try {
    await processTask(taskId);
    const duration = Date.now() - startTime;
    console.log(`[TaskProcessor] Task ${taskId} completed successfully in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[TaskProcessor] Task ${taskId} failed after ${duration}ms: ${errorMessage}`
    );
    // Error is already handled in processTask by updating status to 'failed'
    // Re-throw only for logging purposes, but don't let it crash the app
  }
}

/**
 * Process a task in the background (fire-and-forget with error handling)
 */
export function processTaskInBackground(taskId: string): void {
  // Use setImmediate to ensure the response is sent before processing starts
  setImmediate(async () => {
    try {
      await processTaskSafely(taskId);
    } catch (error) {
      // This should never happen as processTaskSafely handles all errors
      // But just in case, log it
      console.error(`[TaskProcessor] Unexpected error in background processing:`, error);
    }
  });
}

/**
 * Process all pending tasks (useful for recovery after server restart)
 */
export async function processPendingTasks(): Promise<void> {
  try {
    const pendingTasks = await Task.find({ status: 'pending' }).limit(10);
    
    if (pendingTasks.length === 0) {
      console.log('[TaskProcessor] No pending tasks found');
      return;
    }

    console.log(`[TaskProcessor] Found ${pendingTasks.length} pending tasks, processing...`);

    // Process tasks sequentially to avoid overwhelming the system
    for (const task of pendingTasks) {
      await processTaskSafely(task._id.toString());
    }

    console.log(`[TaskProcessor] Finished processing ${pendingTasks.length} pending tasks`);
  } catch (error) {
    console.error('[TaskProcessor] Error processing pending tasks:', error);
  }
}

/**
 * Process all stuck processing tasks (tasks that have been processing for too long)
 * This helps recover from crashes or unexpected shutdowns
 */
export async function recoverStuckTasks(maxProcessingTimeMs: number = 300000): Promise<void> {
  try {
    const cutoffTime = new Date(Date.now() - maxProcessingTimeMs);
    const stuckTasks = await Task.find({
      status: 'processing',
      updatedAt: { $lt: cutoffTime },
    }).limit(10);

    if (stuckTasks.length === 0) {
      return;
    }

    console.log(`[TaskProcessor] Found ${stuckTasks.length} stuck tasks, resetting to pending...`);

    // Reset stuck tasks to pending so they can be retried
    for (const task of stuckTasks) {
      await Task.findByIdAndUpdate(task._id, {
        status: 'pending',
        updatedAt: new Date(),
      });
      console.log(`[TaskProcessor] Reset task ${task._id} to pending`);
    }
  } catch (error) {
    console.error('[TaskProcessor] Error recovering stuck tasks:', error);
  }
}

