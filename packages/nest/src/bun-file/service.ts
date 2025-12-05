import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../file/service';
@Injectable()
export class BunFileService implements FileStorageService {
  async download(filePath: string): Promise<File> {
    const file = Bun.file(filePath);
    return new File([await file.arrayBuffer()], file.name!, { type: file.type });
  }

  async upload(file: File, filePath: string): Promise<void> {
    await Bun.write(filePath, file);
  }

  async delete(filePath: string): Promise<void> {
    await Bun.file(filePath).delete();
  }
}
