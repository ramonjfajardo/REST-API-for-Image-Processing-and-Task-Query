import mongoose, { Schema, Document } from 'mongoose';
import { IImage } from '../types';

export interface ImageDocument extends IImage, Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
}

const ImageSchema = new Schema<ImageDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    resolution: {
      type: String,
      required: true,
      enum: ['1024', '800'],
      index: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    md5: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient queries
ImageSchema.index({ taskId: 1, resolution: 1 });
ImageSchema.index({ md5: 1 });

export const Image = mongoose.model<ImageDocument>('Image', ImageSchema);

