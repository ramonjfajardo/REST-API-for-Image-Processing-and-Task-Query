import mongoose from 'mongoose';
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup';
import {
  createTask,
  getTaskById,
  updateTaskStatus,
  updateTaskWithImages,
} from '../../../src/services/taskService';

describe('Task Service', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('createTask', () => {
    it('should create a task with pending status', async () => {
      const imagePath = '/path/to/image.jpg';
      const task = await createTask(imagePath);

      expect(task).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.originalPath).toBe(imagePath);
      expect(task.price).toBeGreaterThanOrEqual(5);
      expect(task.price).toBeLessThanOrEqual(50);
      expect(task.images).toEqual([]);
    });

    it('should assign a random price between 5 and 50', async () => {
      const task = await createTask('/path/to/image.jpg');
      expect(task.price).toBeGreaterThanOrEqual(5);
      expect(task.price).toBeLessThanOrEqual(50);
    });

    it('should save task to database', async () => {
      const task = await createTask('/path/to/image.jpg');
      const foundTask = await getTaskById(task._id.toString());
      expect(foundTask).toBeDefined();
      expect(foundTask?._id.toString()).toBe(task._id.toString());
    });
  });

  describe('getTaskById', () => {
    it('should return task when found', async () => {
      const task = await createTask('/path/to/image.jpg');
      const foundTask = await getTaskById(task._id.toString());

      expect(foundTask).toBeDefined();
      expect(foundTask?._id.toString()).toBe(task._id.toString());
    });

    it('should return null for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const task = await getTaskById(fakeId);
      expect(task).toBeNull();
    });

    it('should return null for invalid ObjectId', async () => {
      const task = await getTaskById('invalid-id');
      expect(task).toBeNull();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const task = await createTask('/path/to/image.jpg');
      const updatedTask = await updateTaskStatus(task._id.toString(), 'processing');

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe('processing');
    });

    it('should update task status to failed with error message', async () => {
      const task = await createTask('/path/to/image.jpg');
      const errorMessage = 'Processing failed';
      const updatedTask = await updateTaskStatus(
        task._id.toString(),
        'failed',
        errorMessage
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe('failed');
      expect(updatedTask?.error).toBe(errorMessage);
    });
  });

  describe('updateTaskWithImages', () => {
    it('should update task with processed image IDs', async () => {
      const task = await createTask('/path/to/image.jpg');
      const { Image } = await import('../../../src/models/Image');
      
      // Create images in Image collection first
      const image1 = await Image.create({
        taskId: task._id,
        resolution: '1024',
        path: '/output/image1/1024/abc123.jpg',
        md5: 'abc123',
        createdAt: new Date(),
      });

      const image2 = await Image.create({
        taskId: task._id,
        resolution: '800',
        path: '/output/image1/800/def456.jpg',
        md5: 'def456',
        createdAt: new Date(),
      });

      // Update task with image IDs
      const updatedTask = await updateTaskWithImages(
        task._id.toString(),
        [image1._id, image2._id]
      );

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.images).toHaveLength(2);
      
      // Get populated task to verify images
      const populatedTask = await getTaskById(task._id.toString());
      expect(populatedTask).toBeDefined();
      if (populatedTask?.images && populatedTask.images.length > 0) {
        const firstImg = populatedTask.images[0];
        if (firstImg && typeof firstImg === 'object' && 'resolution' in firstImg) {
          expect(firstImg.resolution).toBe('1024');
        }
      }
    });
  });
});

