# REST API for Image Processing and Task Query

A REST API built with Node.js and TypeScript that processes images and manages task queries with MongoDB persistence. The API generates image variants at specific resolutions and provides task status tracking with pricing information.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture Decisions](#architecture-decisions)

## Features

- **Image Processing**: Generate variants at 1024px and 800px width (maintaining aspect ratio)
- **Task Management**: Create and query image processing tasks with status tracking
- **Pricing System**: Random price assignment (5-50 currency units) for each task
- **Async Processing**: Non-blocking background task processing
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Input validation for requests
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and integration tests
- **MongoDB Integration**: Efficient data persistence with indexes

## Architecture

The application follows a modular, API-First architecture with clear separation of concerns:

```
┌─────────────┐
│   Routes    │  ← API Endpoints
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │  ← Request Handling
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │  ← Business Logic
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │  ← Data Layer
└──────┬──────┘
       │
┌──────▼──────┐
│  MongoDB    │  ← Database
└─────────────┘
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic for task and image processing
- **Models**: MongoDB schemas with validation
- **Middleware**: Error handling, validation, and request processing
- **Utils**: Utility functions for file operations, pricing, etc.

## Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Image Processing**: Sharp
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- **Testing**: Jest, Supertest, mongodb-memory-server
- **Code Quality**: ESLint, Prettier

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) - local installation or Docker
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd REST-API-for-Image-Processing-and-Task-Query
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/image-processing-api
   OUTPUT_DIR=./output
   INPUT_DIR=./input
   ```

4. **Start MongoDB**
   
   **Option 1: Local MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```
   
   **Option 2: Docker**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/image-processing-api` |
| `OUTPUT_DIR` | Directory for processed images | `./output` |
| `INPUT_DIR` | Directory for input images | `./input` |

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production Mode

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run db:init` | Initialize database indexes |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:clear` | Clear all database data |
| `npm run db:reset` | Clear and reseed database |

## API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

### Endpoints

#### POST /tasks

Create a new image processing task.

**Request Body:**
```json
{
  "imagePath": "/path/to/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "pending",
  "price": 25.5
}
```

**Example with URL:**
```json
{
  "imagePath": "https://example.com/image.jpg"
}
```

#### GET /tasks/:taskId

Get task status and results.

**Response (200 OK) - Pending:**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "pending",
  "price": 25.5
}
```

**Response (200 OK) - Completed:**
```json
{
  "taskId": "65d4a54b89c5e342b2c2c5f6",
  "status": "completed",
  "price": 25.5,
  "images": [
    {
      "resolution": "1024",
      "path": "/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg"
    },
    {
      "resolution": "800",
      "path": "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg"
    }
  ]
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request data or taskId format
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

#### GET /health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-06-01T12:00:00.000Z"
}
```

## Database Setup

### Initialize Database

Create indexes for optimal performance:

```bash
npm run db:init
```

### Seed Sample Data

Populate the database with sample tasks:

```bash
npm run db:seed
```

This creates tasks with different statuses:
- Completed tasks with processed images
- Pending tasks
- Processing tasks
- Failed tasks with error messages

### Clear Database

Remove all data:

```bash
npm run db:clear
```

### Reset Database

Clear and reseed:

```bash
npm run db:reset
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: `tests/unit/` - Test individual utilities and services
- **Integration Tests**: `tests/integration/` - Test API endpoints end-to-end

### Test Coverage

The project includes comprehensive tests for:
- Utility functions (file operations, pricing)
- Service layer (task management, image processing)
- API endpoints (request/response handling, error cases)
- Database operations

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── swagger.ts  # Swagger configuration
│   ├── controllers/    # Request handlers
│   │   └── taskController.ts
│   ├── middleware/     # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── models/         # Mongoose models
│   │   ├── Task.ts
│   │   └── Image.ts
│   ├── routes/         # API routes
│   │   └── taskRoutes.ts
│   ├── services/       # Business logic
│   │   ├── imageProcessingService.ts
│   │   ├── taskService.ts
│   │   └── taskProcessor.ts
│   ├── utils/          # Utility functions
│   │   ├── fileUtils.ts
│   │   ├── priceUtils.ts
│   │   └── errorUtils.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── app.ts          # Express app setup
│   └── index.ts        # Application entry point
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── helpers/        # Test utilities
│   └── setup.ts        # Test database setup
├── scripts/            # Database scripts
│   ├── init-db.ts
│   ├── seed-db.ts
│   └── clear-db.ts
├── .env.example        # Environment variables template
├── .gitignore
├── jest.config.js     # Jest configuration
├── package.json
├── tsconfig.json      # TypeScript configuration
└── README.md
```

## Architecture Decisions

### Framework Choice: Express.js

- **Reason**: Lightweight, flexible, and well-documented
- **Alternative Considered**: NestJS (more opinionated, better for larger teams)

### Database: MongoDB

- **Reason**: Flexible schema for task and image data, good performance with indexes
- **Features**: Embedded documents for images, efficient querying

### Image Processing: Sharp

- **Reason**: High performance, supports various formats, maintains quality
- **Benefits**: Fast processing, memory efficient

### Background Processing

- **Approach**: Fire-and-forget with `setImmediate` for non-blocking processing
- **Reason**: Simple, effective for this use case
- **Alternative Considered**: Queue system (Bull, RabbitMQ) - overkill for this scale

### Error Handling

- **Approach**: Centralized error middleware with custom error classes
- **Benefits**: Consistent error responses, easy to maintain

### Validation

- **Approach**: express-validator with custom validators
- **Benefits**: Declarative validation, reusable rules

### Testing Strategy

- **Unit Tests**: Test services and utilities in isolation
- **Integration Tests**: Test API endpoints with in-memory MongoDB
- **Coverage**: Aim for >80% code coverage

### File Storage

- **Approach**: Local file system with organized directory structure
- **Structure**: `/output/{original_name}/{resolution}/{md5}.{ext}`
- **Benefits**: Simple, no external dependencies, easy to backup

## Image Processing Details

### Supported Formats

The API supports all formats supported by Sharp:
- JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG

### Processing Behavior

- **Resolutions**: 1024px and 800px width
- **Aspect Ratio**: Maintained automatically
- **Enlargement**: Images smaller than target resolution are not enlarged
- **Output Format**: Same as input format
- **Naming**: MD5 hash of processed image content

### Storage Path Format

```
/output/{original_name}/{resolution}/{md5}.{ext}
```

Example:
```
/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg
/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg
```

## Error Handling

### Error Response Format

```json
{
  "status": "fail" | "error",
  "message": "Error message",
  "stack": "..." // Only in development
}
```

### Common Error Codes

- `400 Bad Request`: Invalid input data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Considerations

- Input validation and sanitization
- Path traversal protection
- File type validation
- Error message sanitization (no sensitive data exposed)
- CORS enabled for API access

## Performance Optimizations

- MongoDB indexes on frequently queried fields (status, createdAt, md5)
- Efficient image processing with Sharp
- Async task processing (non-blocking)
- Proper error handling to prevent memory leaks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

