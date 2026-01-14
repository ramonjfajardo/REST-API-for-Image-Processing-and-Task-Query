import { IImage } from '../types';

export interface IImageRepository {
  create(imageData: Partial<IImage> & { taskId: any }, session?: any): Promise<any>;
  deleteManyByIds(ids: any[]): Promise<void>;
}
