import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing API',
      version: '1.0.0',
      description:
        'REST API for Image Processing and Task Query. This API allows you to create image processing tasks and query their status.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        CreateTaskRequest: {
          type: 'object',
          required: ['imagePath'],
          properties: {
            imagePath: {
              type: 'string',
              description: 'Local file path or URL of the image to process',
              example: '/path/to/image.jpg',
            },
          },
        },
        TaskResponse: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Unique identifier of the task',
              example: '65d4a54b89c5e342b2c2c5f6',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              description: 'Current status of the task',
              example: 'pending',
            },
            price: {
              type: 'number',
              description: 'Price associated with the task (between 5 and 50)',
              example: 25.5,
              minimum: 5,
              maximum: 50,
            },
            images: {
              type: 'array',
              description: 'Array of processed image variants (only present when status is completed)',
              items: {
                $ref: '#/components/schemas/ImageResponse',
              },
            },
          },
        },
        ImageResponse: {
          type: 'object',
          properties: {
            resolution: {
              type: 'string',
              enum: ['1024', '800'],
              description: 'Width resolution of the processed image',
              example: '1024',
            },
            path: {
              type: 'string',
              description: 'Relative path to the processed image',
              example: '/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['fail', 'error'],
              description: 'Error status type',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Tasks',
        description: 'Image processing task management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoint',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts', './src/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

