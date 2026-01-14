import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup';
import { Task } from '../../src/models/Task';
import { Image } from '../../src/models/Image';

describe('Tasks API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid image path', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('taskId');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('price');
      expect(response.body.price).toBeGreaterThanOrEqual(5);
      expect(response.body.price).toBeLessThanOrEqual(50);
    });

    it('should store /input/ paths as-is (not converted to localhost URL)', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: '/input/image1/1024/abc123.jpg',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('taskId');

      // Verify the stored task originalPath is stored as local input path
      const task = await Task.findById(response.body.taskId);
      expect(task).toBeDefined();
      expect(task?.originalPath).toBe('/input/image1/1024/abc123.jpg');
    });

    it('should create a task with URL', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: 'https://example.com/image.jpg',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('taskId');
      expect(response.body.status).toBe('pending');
    });

    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app).post('/tasks').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if imagePath is empty', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: '',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('should return 400 if imagePath is not a string', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: 123,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('should store task in database', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      const task = await Task.findById(response.body.taskId);
      expect(task).toBeDefined();
      // Status might be 'pending' or 'processing' since background processing starts immediately
      expect(['pending', 'processing', 'failed']).toContain(task?.status);
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return task details for existing task', async () => {
      // Create a task first
      const createResponse = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      const taskId = createResponse.body.taskId;

      // Get the task
      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('taskId', taskId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/tasks/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid taskId format', async () => {
      const response = await request(app).get('/tasks/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('ObjectId');
    });

    it('should return images array when task is completed', async () => {
      // Create a task
      const createResponse = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      const taskId = createResponse.body.taskId;

      // Wait a bit for background processing to start/fail
      await new Promise(resolve => setTimeout(resolve, 100));

      // Manually create images in Image collection and link to task (override any background processing)
      const image1 = await Image.create({
        taskId: new mongoose.Types.ObjectId(taskId),
        resolution: '1024',
        path: '/output/image1/1024/abc123.jpg',
        md5: 'abc123',
        createdAt: new Date(),
      });

      const image2 = await Image.create({
        taskId: new mongoose.Types.ObjectId(taskId),
        resolution: '800',
        path: '/output/image1/800/def456.jpg',
        md5: 'def456',
        createdAt: new Date(),
      });

      // Update task to completed with image references
      await Task.findByIdAndUpdate(
        taskId,
        {
          status: 'completed',
          images: [image1._id, image2._id],
        },
        { overwrite: false }
      );

      // Get the task
      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(response.body.images).toHaveLength(2);
      expect(response.body.images[0]).toHaveProperty('resolution');
      expect(response.body.images[0]).toHaveProperty('path');
    });

    it('should not return images array when task is pending', async () => {
      // Create a task
      const createResponse = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      const taskId = createResponse.body.taskId;

      // Get the task immediately (before background processing completes)
      // Since background processing fails quickly (image doesn't exist),
      // we check that if status is 'pending', images should not be present
      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      // Task might be 'pending', 'processing', or 'failed' due to background processing
      if (response.body.status === 'pending' || response.body.status === 'processing') {
        expect(response.body).not.toHaveProperty('images');
      } else {
        // If task failed, it should not have images array in the response
        expect(response.body).not.toHaveProperty('images');
      }
    });
  });

  describe('Task Processing Flow', () => {
    it('should create task and return immediately with pending status', async () => {
      const response = await request(app).post('/tasks').send({
        imagePath: '/path/to/image.jpg',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('taskId');
      expect(response.body).toHaveProperty('price');
    });
  });
});

