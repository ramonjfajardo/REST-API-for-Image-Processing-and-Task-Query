# Database Scripts

This directory contains utility scripts for database management.

## Available Scripts

### Initialize Database
```bash
npm run db:init
```
Creates MongoDB indexes for optimal query performance.

### Seed Database
```bash
npm run db:seed
```
Populates the database with sample data including:
- Completed tasks with processed images
- Pending tasks
- Processing tasks
- Failed tasks with error messages

### Clear Database
```bash
npm run db:clear
```
Removes all tasks from the database.

### Reset Database
```bash
npm run db:reset
```
Clears the database and seeds it with fresh sample data.

## Sample Data

The seed script creates 5 sample tasks with different statuses:

1. **Completed Task** - Has processed images at 1024px and 800px resolutions
2. **Pending Task** - Waiting to be processed
3. **Processing Task** - Currently being processed
4. **Failed Task** - Contains error message
5. **Completed Task (URL)** - Processed from a URL source

## Environment Variables

Make sure your `.env` file is configured with the correct `MONGODB_URI` before running these scripts.

