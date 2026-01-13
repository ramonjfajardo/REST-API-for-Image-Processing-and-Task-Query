import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, ITask, IImage } from '../types';

export interface TaskDocument extends ITask, Document {
  _id: mongoose.Types.ObjectId;
}

const ImageSchema = new Schema<IImage>(
  {
    resolution: {
      type: String,
      required: true,
      enum: ['1024', '800'],
    },
    path: {
      type: String,
      required: true,
    },
    md5: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TaskSchema = new Schema<TaskDocument>(
  {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 5,
      max: 50,
    },
    originalPath: {
      type: String,
      required: true,
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
TaskSchema.index({ status: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ 'images.md5': 1 });

export const Task = mongoose.model<TaskDocument>('Task', TaskSchema);

