export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ITask {
  _id?: string;
  status: TaskStatus;
  price: number;
  originalPath: string;
  images?: IImage[] | string[]; // Can be IImage[] when populated, or ObjectId[] when not
  createdAt?: Date;
  updatedAt?: Date;
  error?: string;
}

export interface IImage {
  resolution: string;
  path: string;
  md5: string;
  createdAt?: Date;
}

export interface CreateTaskRequest {
  imagePath: string;
}

export interface TaskResponse {
  taskId: string;
  status: TaskStatus;
  price: number;
  images?: ImageResponse[];
}

export interface ImageResponse {
  resolution: string;
  path: string;
}

