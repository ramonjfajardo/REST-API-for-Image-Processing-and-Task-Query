import { ITask, TaskStatus } from '../types';

export interface ITaskRepository {
  create(taskData: Partial<ITask>): Promise<any>;
  findById(taskId: string, populate?: boolean): Promise<any | null>;
  findPending(limit?: number): Promise<any[]>;
  findStuck(cutoff: Date, limit?: number): Promise<any[]>;
  updateStatus(taskId: string, status: TaskStatus, error?: string): Promise<any | null>;
  updateWithImages(taskId: string, imageIds: any[], session?: any): Promise<any | null>;
  startSession?(): Promise<any>;
}
