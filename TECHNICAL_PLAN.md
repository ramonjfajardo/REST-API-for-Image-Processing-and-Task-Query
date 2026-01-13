# Technical Plan: REST API for Image Processing and Task Query

## Project Overview
A REST API built with Node.js and TypeScript that processes images and manages task queries with MongoDB persistence.

## Architecture Decisions

### Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js (lightweight, flexible for this use case)
- **Database**: MongoDB with Mongoose ODM
- **Image Processing**: Sharp
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express)
- **Testing**: Jest + Supertest
- **Validation**: express-validator or zod
- **Environment**: dotenv

### Project Structure
```
src/
├── config/           # Configuration files (database, app settings)
├── controllers/      # Route handlers
├── models/          # Mongoose models (Task, Image)
├── services/        # Business logic (image processing, task management)
├── routes/          # Express routes
├── middleware/      # Custom middleware (error handling, validation)
├── utils/           # Utility functions (file operations, MD5 hashing)
├── types/           # TypeScript type definitions
├── tests/           # Test files
│   ├── unit/       # Unit tests
│   └── integration/ # Integration tests
└── app.ts          # Express app setup
```

## Implementation Steps

### Step 1: Project Initialization
- Initialize npm project
- Install dependencies (express, typescript, mongoose, sharp, etc.)
- Setup TypeScript configuration
- Setup ESLint and Prettier
- Create basic folder structure
- Initialize Git repository
- Create .gitignore

### Step 2: Database Setup
- Setup MongoDB connection (Mongoose)
- Create Task model schema
- Create Image model schema
- Add MongoDB indexes
- Create database configuration

### Step 3: Core Services
- Image processing service (Sharp integration)
- Task management service
- File system utilities (path handling, MD5 hashing)
- Price generation utility

### Step 4: API Routes & Controllers
- POST /tasks endpoint
- GET /tasks/:taskId endpoint
- Request validation middleware
- Error handling middleware

### Step 5: Background Processing
- Task queue/processing system
- Async image processing
- Task status updates

### Step 6: Error Handling & Validation
- Centralized error handler
- Input validation
- Error response formatting

### Step 7: API Documentation
- Swagger/OpenAPI setup
- Endpoint documentation
- Schema definitions

### Step 8: Testing
- Unit tests for services
- Integration tests for API endpoints
- Test utilities and fixtures

### Step 9: Scripts & Utilities
- Database initialization script
- Sample data seeding
- Development scripts

### Step 10: Documentation
- README.md with setup instructions
- Architecture documentation
- API usage examples

## Data Models

### Task Model
```typescript
{
  _id: ObjectId
  status: 'pending' | 'processing' | 'completed' | 'failed'
  price: number (5-50)
  originalPath: string
  images: Image[]
  createdAt: Date
  updatedAt: Date
  error?: string
}
```

### Image Model
```typescript
{
  resolution: string ('1024' | '800')
  path: string
  md5: string
  createdAt: Date
}
```

## API Endpoints

### POST /tasks
- **Request**: `{ "imagePath": "string" }` (local path or URL)
- **Response**: `{ taskId, status, price }`
- **Validation**: Validate image path/URL exists and is accessible

### GET /tasks/:taskId
- **Response**: `{ taskId, status, price, images? }`
- **Errors**: 404 if task not found

## Image Processing Logic
1. Receive image path/URL
2. Download/read image
3. Generate MD5 hash
4. Create variants:
   - 1024px width (maintain aspect ratio)
   - 800px width (maintain aspect ratio)
5. Save to: `/output/{original_name}/{resolution}/{md5}.{ext}`
6. Store image records in MongoDB
7. Update task status

## MongoDB Indexes
- `tasks._id` (automatic)
- `tasks.status`
- `tasks.createdAt`
- `images.md5`
- `images.path`

## Error Handling Strategy
- Try-catch blocks in async operations
- Centralized error middleware
- Standardized error response format
- Logging errors
- Task status update to 'failed' on errors

## Testing Strategy
- Unit tests: Services, utilities
- Integration tests: API endpoints, database operations
- Test coverage: >80%
- Mock external dependencies (file system, HTTP requests)

## Security Considerations
- Input validation and sanitization
- Path traversal protection
- File type validation
- Size limits for images
- Error message sanitization

## Performance Optimizations
- MongoDB indexes on frequently queried fields
- Efficient image processing with Sharp
- Async task processing
- Proper error handling to prevent memory leaks

