import { Module } from '@nestjs/common';
import { S3Service } from './service';
import { S3Client } from 'bun';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const S3OptionsSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  region: z.string(),
  endpoint: z.string(),
  bucket: z.string(),
});

export const S3ConfigSchema = z.object({
  s3: S3OptionsSchema,
});

export type S3Config = z.infer<typeof S3ConfigSchema>;
type S3Options = z.infer<typeof S3OptionsSchema>;

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const s3ClientConfig = configService.get<S3Options>('s3')!;
        return new S3Client(s3ClientConfig);
      },
      inject: [ConfigService],
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
