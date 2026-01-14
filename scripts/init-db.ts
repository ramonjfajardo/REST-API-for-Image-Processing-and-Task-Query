import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { Task } from '../src/models/Task';

dotenv.config();

/**
 * Initialize database with indexes
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();

    console.log('Creating indexes...');
    // Indexes are automatically created by Mongoose based on schema definitions
    // But we can ensure they exist by calling createIndexes
    await Task.createIndexes();

    console.log('Database initialized successfully!');
    console.log('Indexes created:');
    const indexes = await Task.collection.indexes();
    indexes.forEach((index) => {
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

