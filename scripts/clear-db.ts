import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Task } from '../src/models/Task';
import { Image } from '../src/models/Image';

dotenv.config();

/**
 * Clear all data from database (both tasks and images collections)
 */
async function clearDatabase(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();

    console.log('Clearing all images...');
    const imageResult = await Image.deleteMany({});
    console.log(`Deleted ${imageResult.deletedCount} images`);

    console.log('Clearing all tasks...');
    const taskResult = await Task.deleteMany({});
    console.log(`Deleted ${taskResult.deletedCount} tasks`);

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('Database clearing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database clearing failed:', error);
      process.exit(1);
    });
}

export { clearDatabase };

