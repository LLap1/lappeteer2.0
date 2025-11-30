import { Module } from '@nestjs/common';
import { S3Service } from './service';
import { S3Client } from 'bun';
import { ConfigService } from '@nestjs/config';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint: string;
  bucket: string;
}

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const s3ClientConfig = configService.get<S3Config>('s3')!;
        return new S3Client(s3ClientConfig);
      },
      inject: [ConfigService],
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
