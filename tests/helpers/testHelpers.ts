import { Task } from '../../src/models/Task';
import { IImage } from '../../src/types';

/**
 * Create a test task
 */
export async function createTestTask(
  imagePath: string = '/test/image.jpg',
  status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending'
): Promise<any> {
  return await Task.create({
    status,
    price: 25.5,
    originalPath: imagePath,
    images: [],
  });
}

/**
 * Create a test task with completed status and images
 */
export async function createCompletedTestTask(
  imagePath: string = '/test/image.jpg'
): Promise<any> {
  const images: IImage[] = [
    {
      resolution: '1024',
      path: '/output/test/1024/abc123.jpg',
      md5: 'abc123',
      createdAt: new Date(),
    },
    {
      resolution: '800',
      path: '/output/test/800/def456.jpg',
      md5: 'def456',
      createdAt: new Date(),
    },
  ];

  return await Task.create({
    status: 'completed',
    price: 25.5,
    originalPath: imagePath,
    images,
  });
}

