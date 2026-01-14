import { Image } from '../../models/Image';
import { IImageRepository } from '../../ports/IImageRepository';

export class MongooseImageRepository implements IImageRepository {
  async create(imageData: Partial<any> & { taskId: any }, session?: any) {
    const image = new Image(imageData);
    if (session) {
      await image.save({ session });
    } else {
      await image.save();
    }
    return image;
  }

  async deleteManyByIds(ids: any[]) {
    await Image.deleteMany({ _id: { $in: ids } });
  }
}

export const imageRepository = new MongooseImageRepository();
