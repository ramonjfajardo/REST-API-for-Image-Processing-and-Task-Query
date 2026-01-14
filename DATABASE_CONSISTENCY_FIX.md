# Database Consistency Fix - Separate Collections

## Summary

The project has been refactored to maintain consistent records in separate `tasks` and `images` collections in MongoDB, as required by the acceptance criteria. Previously, images were stored as embedded documents within tasks. Now, images are stored in a separate collection with proper references and transactional consistency.

## Changes Made

### 1. **Task Model** (`src/models/Task.ts`)
- **Before**: Images stored as embedded subdocuments (`ImageSchema` with `{ _id: false }`)
- **After**: Images stored as references to separate collection (`ObjectId[]` with `ref: 'Image'`)
- Updated indexes to index the `images` array field for efficient queries

### 2. **Image Model** (`src/models/Image.ts`)
- **Added**: `taskId` field with reference to Task collection
- **Added**: Compound index on `{ taskId: 1, resolution: 1 }` for efficient queries
- Images now properly stored as separate documents with bidirectional relationship

### 3. **Image Processing Service** (`src/services/imageProcessingService.ts`)
- **Updated**: `processImage()` function now:
  - Accepts `taskId` parameter to link images to tasks
  - Accepts optional MongoDB session for transactions
  - Saves images to `Image` collection instead of embedding
  - Returns both image IDs and image data

### 4. **Task Service** (`src/services/taskService.ts`)
- **Updated**: `getTaskById()` now populates images from Image collection
- **Updated**: `updateTaskWithImages()` now accepts image IDs instead of image objects
- **Added**: MongoDB transactions in `processTask()` to ensure atomic updates:
  - Both image creation and task update happen within a single transaction
  - On failure, transaction is rolled back to maintain consistency
  - Ensures both collections are updated atomically

### 5. **Task Controller** (`src/controllers/taskController.ts`)
- **Updated**: `getTaskHandler()` now handles populated images from separate collection
- Images are populated when querying tasks and filtered appropriately

### 6. **Database Initialization** (`scripts/init-db.ts`)
- **Added**: Image collection index creation
- Creates indexes for both `tasks` and `images` collections
- Displays indexes for both collections after initialization

### 7. **Database Scripts**
- **`scripts/seed-db.ts`**: Updated to create images in Image collection first, then link them to tasks
- **`scripts/clear-db.ts`**: Updated to clear both `tasks` and `images` collections

### 8. **Tests**
- **Integration Tests** (`tests/integration/tasks.test.ts`): Updated to create images in Image collection before linking to tasks
- **Unit Tests** (`tests/unit/services/taskService.test.ts`): Updated to work with image IDs instead of embedded documents

## Data Consistency Guarantees

### Transactional Updates
All image processing operations use MongoDB transactions to ensure atomicity:
1. Images are created in `Image` collection
2. Task is updated with image references
3. Both operations succeed or both fail (rollback on error)

### Indexes for Performance
- **Task Collection**:
  - `status` index for querying by status
  - `createdAt` index for sorting
  - `images` index for image references
  
- **Image Collection**:
  - `taskId` index for linking to tasks
  - `taskId + resolution` compound index for efficient queries
  - `md5` index for deduplication
  - `path` unique index to prevent duplicates

### Bidirectional Relationship
- Tasks reference images via `images: ObjectId[]`
- Images reference tasks via `taskId: ObjectId`
- This enables efficient querying from both directions

## Database Schema

### Tasks Collection
```typescript
{
  _id: ObjectId,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  price: number (5-50),
  originalPath: string,
  images: ObjectId[],  // References to Image collection
  error?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Images Collection
```typescript
{
  _id: ObjectId,
  taskId: ObjectId,      // Reference to Task collection
  resolution: '1024' | '800',
  path: string (unique),
  md5: string,
  createdAt: Date
}
```

## Usage

### Initialize Database (includes both collections)
```bash
npm run db:init
```

### Seed Database (creates records in both collections)
```bash
npm run db:seed
```

### Clear Database (clears both collections)
```bash
npm run db:clear
```

## Benefits

1. **Data Consistency**: MongoDB transactions ensure both collections are updated atomically
2. **Normalization**: Images stored separately allow for better data management
3. **Query Efficiency**: Indexes on both collections enable fast queries
4. **Flexibility**: Images can be queried independently or via task references
5. **Scalability**: Separate collections allow for better horizontal scaling

## Testing

All tests have been updated to work with separate collections:
- Integration tests create images in Image collection before linking
- Unit tests use image IDs instead of embedded documents
- Database clearing scripts clear both collections

## Migration Notes

If you have existing data:
1. The schema change requires migrating existing embedded images to the Image collection
2. You may need to create a migration script to:
   - Extract embedded images from tasks
   - Create Image documents
   - Update tasks with image references

For new installations, simply run `npm run db:init` to set up indexes for both collections.

