import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types';

export interface TaskDocument extends Omit<ITask, '_id' | 'images'>, Document {
  _id: mongoose.Types.ObjectId;
  images: mongoose.Types.ObjectId[];
}

const TaskSchema = new Schema<TaskDocument>(
  {
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
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
      type: [Schema.Types.ObjectId],
      ref: 'Image',
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
TaskSchema.index({ images: 1 });

export const Task = mongoose.model<TaskDocument>('Task', TaskSchema);

