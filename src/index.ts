import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import { processPendingTasks, recoverStuckTasks } from './services/taskProcessor';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Recover stuck tasks (tasks stuck in processing state)
    await recoverStuckTasks();

    // Process any pending tasks (optional - can be disabled in production)
    // Uncomment the line below if you want to auto-process pending tasks on startup
    // await processPendingTasks();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

