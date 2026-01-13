import mongoose, { Schema, Document } from 'mongoose';
import { IImage } from '../types';

export interface ImageDocument extends IImage, Document {
  _id: mongoose.Types.ObjectId;
}

const ImageSchema = new Schema<ImageDocument>(
  {
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

export const Image = mongoose.model<ImageDocument>('Image', ImageSchema);

