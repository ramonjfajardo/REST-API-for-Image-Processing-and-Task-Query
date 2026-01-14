import mongoose from 'mongoose';
import { Task } from '../../models/Task';
import { ITask, TaskStatus } from '../../types';
import { ITaskRepository } from '../../ports/ITaskRepository';

export class MongooseTaskRepository implements ITaskRepository {
  async create(taskData: Partial<ITask>) {
    const task = new Task(taskData);
    await task.save();
    return task;
  }

  async findById(taskId: string, populate: boolean = false) {
    const query = Task.findById(taskId);
    if (populate) {
      query.populate('images');
    }
    return query.exec();
  }

  async findPending(limit: number = 10) {
    return Task.find({ status: 'pending' }).limit(limit).exec();
  }

  async findStuck(cutoff: Date, limit: number = 10) {
    return Task.find({ status: 'processing', updatedAt: { $lt: cutoff } }).limit(limit).exec();
  }

  async updateStatus(taskId: string, status: TaskStatus, error?: string) {
    const updateData: any = { status, updatedAt: new Date() };
    if (error) updateData.error = error;
    return Task.findByIdAndUpdate(taskId, updateData, { new: true }).exec();
  }

  async updateWithImages(taskId: string, imageIds: any[], session?: mongoose.ClientSession) {
    return Task.findByIdAndUpdate(
      taskId,
      {
        status: 'completed',
        images: imageIds,
        updatedAt: new Date(),
      },
      { new: true, session }
    ).exec();
  }

  async startSession() {
    return mongoose.startSession();
  }
}

export const taskRepository = new MongooseTaskRepository();
