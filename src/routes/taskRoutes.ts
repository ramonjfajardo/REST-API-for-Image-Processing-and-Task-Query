import { Router } from 'express';
import { createTaskHandler, getTaskHandler } from '../controllers/taskController';
import { validateCreateTask, validateTaskId } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /tasks
 * @desc    Create a new image processing task
 * @access  Public
 */
router.post('/', validateCreateTask, createTaskHandler);

/**
 * @route   GET /tasks/:taskId
 * @desc    Get task status and results
 * @access  Public
 */
router.get('/:taskId', validateTaskId, getTaskHandler);

export default router;

