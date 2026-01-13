import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Task } from '../src/models/Task';
import { IImage } from '../src/types';

dotenv.config();

/**
 * Seed database with sample data
 */
async function seedDatabase(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();

    // Clear existing tasks
    console.log('Clearing existing tasks...');
    await Task.deleteMany({});

    // Create sample tasks
    const sampleTasks = [
      {
        status: 'completed' as const,
        price: 25.5,
        originalPath: '/input/sample1.jpg',
        images: [
          {
            resolution: '1024',
            path: '/output/sample1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg',
            md5: 'f322b730b287da77e1c519c7ffef4fc2',
            createdAt: new Date('2024-06-01T12:00:00'),
          },
          {
            resolution: '800',
            path: '/output/sample1/800/202fd8b3174a774bac24428e8cb230a1.jpg',
            md5: '202fd8b3174a774bac24428e8cb230a1',
            createdAt: new Date('2024-06-01T12:00:00'),
          },
        ] as IImage[],
        createdAt: new Date('2024-06-01T12:00:00'),
        updatedAt: new Date('2024-06-01T12:10:00'),
      },
      {
        status: 'pending' as const,
        price: 15.75,
        originalPath: '/input/sample2.jpg',
        images: [],
        createdAt: new Date('2024-06-01T13:00:00'),
        updatedAt: new Date('2024-06-01T13:00:00'),
      },
      {
        status: 'processing' as const,
        price: 42.25,
        originalPath: '/input/sample3.jpg',
        images: [],
        createdAt: new Date('2024-06-01T14:00:00'),
        updatedAt: new Date('2024-06-01T14:05:00'),
      },
      {
        status: 'failed' as const,
        price: 8.5,
        originalPath: '/input/sample4.jpg',
        images: [],
        error: 'Image file not found: /input/sample4.jpg',
        createdAt: new Date('2024-06-01T15:00:00'),
        updatedAt: new Date('2024-06-01T15:02:00'),
      },
      {
        status: 'completed' as const,
        price: 33.0,
        originalPath: 'https://example.com/image.jpg',
        images: [
          {
            resolution: '1024',
            path: '/output/image/1024/abc123def456ghi789.jpg',
            md5: 'abc123def456ghi789',
            createdAt: new Date('2024-06-01T16:00:00'),
          },
          {
            resolution: '800',
            path: '/output/image/800/xyz789uvw456rst123.jpg',
            md5: 'xyz789uvw456rst123',
            createdAt: new Date('2024-06-01T16:00:00'),
          },
        ] as IImage[],
        createdAt: new Date('2024-06-01T16:00:00'),
        updatedAt: new Date('2024-06-01T16:05:00'),
      },
    ];

    console.log('Creating sample tasks...');
    const createdTasks = await Task.insertMany(sampleTasks);

    console.log(`Successfully created ${createdTasks.length} sample tasks:`);
    createdTasks.forEach((task) => {
      console.log(`  - Task ${task._id}: ${task.status} (Price: ${task.price})`);
    });

    console.log('\nSample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };

