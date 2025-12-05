import { Global, Module } from '@nestjs/common';
import { FileStorageService } from './service';
import { ConfigService } from '@nestjs/config';
import { BunFileService } from '../bun-file/service';
import { S3Service } from '../s3/service';
import { z } from 'zod';
import { BunFileModule } from '../bun-file/module';
import { S3Module } from '../s3/module';

export const FileStorageTypeSchema = z.enum(['bun', 's3']);

export const FileStorageOptionsSchema = z.object({
  type: FileStorageTypeSchema,
});

export const FileStorageConfigSchema = z.object({
  fileStorage: FileStorageOptionsSchema,
});

export type FileStorageType = z.infer<typeof FileStorageTypeSchema>;
export type FileStorageConfig = z.infer<typeof FileStorageConfigSchema>;
type FileStorageOptions = z.infer<typeof FileStorageOptionsSchema>;

@Module({
  imports: [BunFileModule, S3Module],
  providers: [
    {
      provide: FileStorageService,
      useFactory: (configService: ConfigService, bunFileService: BunFileService, s3Service: S3Service) => {
        const fileStorageType = configService.get<FileStorageOptions>('fileStorage')?.type;
        switch (fileStorageType) {
          case 'bun':
            return bunFileService;
          case 's3':
            return s3Service;
          default:
            throw new Error(`Unsupported file storage: ${configService.get('file.storage')}`);
        }
      },
      inject: [ConfigService, BunFileService, S3Service],
    },
  ],
  exports: [FileStorageService],
})
@Global()
export class FileStorageModule {}
