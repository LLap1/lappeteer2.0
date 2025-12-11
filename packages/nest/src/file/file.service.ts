export abstract class FileStorageService {
  abstract upload(file: File, filePath: string): Promise<void>;
  abstract download(filePath: string): Promise<File>;
  abstract delete(filePath: string): Promise<void>;
}
