import { Router } from 'express';
import { createTaskHandler, getTaskHandler } from '../controllers/taskController';
import { validateCreateTask, validateTaskId } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new image processing task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           examples:
 *             localFile:
 *               value:
 *                 imagePath: "/path/to/image.jpg"
 *             url:
 *               value:
 *                 imagePath: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               taskId: "65d4a54b89c5e342b2c2c5f6"
 *               status: "pending"
 *               price: 25.5
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "imagePath is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateCreateTask, createTaskHandler);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task status and results
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task
 *         example: "65d4a54b89c5e342b2c2c5f6"
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             examples:
 *               pending:
 *                 value:
 *                   taskId: "65d4a54b89c5e342b2c2c5f6"
 *                   status: "pending"
 *                   price: 25.5
 *               completed:
 *                 value:
 *                   taskId: "65d4a54b89c5e342b2c2c5f6"
 *                   status: "completed"
 *                   price: 25.5
 *                   images:
 *                     - resolution: "1024"
 *                       path: "/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg"
 *                     - resolution: "800"
 *                       path: "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Task with ID 65d4a54b89c5e342b2c2c5f6 not found"
 *       400:
 *         description: Invalid taskId format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "taskId must be a valid MongoDB ObjectId"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:taskId', validateTaskId, getTaskHandler);

export default router;

