import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Client } from 'bun';
import { z } from 'zod';

const S3OptionsSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  region: z.string(),
  endpoint: z.string(),
  bucket: z.string(),
});

export type S3Options = z.infer<typeof S3OptionsSchema>;
export const S3ConfigSchema = z.object({
  s3: S3OptionsSchema,
});

@Global()
@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (config: S3Options) => {
        return new S3Client(config);
      },
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
