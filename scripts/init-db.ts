import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Task } from '../src/models/Task';
import { Image } from '../src/models/Image';

dotenv.config();

/**
 * Initialize database with indexes for both tasks and images collections
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();

    console.log('Creating indexes for tasks collection...');
    // Indexes are automatically created by Mongoose based on schema definitions
    // But we can ensure they exist by calling createIndexes
    await Task.createIndexes();

    console.log('Creating indexes for images collection...');
    await Image.createIndexes();

    console.log('Database initialized successfully!');
    console.log('\nTask collection indexes:');
    const taskIndexes = await Task.collection.indexes();
    taskIndexes.forEach((index) => {
      console.log(`  - ${JSON.stringify(index)}`);
    });

    console.log('\nImage collection indexes:');
    const imageIndexes = await Image.collection.indexes();
    imageIndexes.forEach((index) => {
      console.log(`  - ${JSON.stringify(index)}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };

