export interface StorageProvider {
  upload(file: Express.Multer.File): Promise<string>;
  delete(url: string): Promise<void>;
}