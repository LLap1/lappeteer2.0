import { Global, Module } from '@nestjs/common';
import { S3Client, type S3Options } from 'bun';
import { z } from 'zod';

const S3OptionsSchema: z.ZodType<S3Options> = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  region: z.string(),
  endpoint: z.string(),
  bucket: z.string(),
});

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
  ],
  exports: [S3Client],
})
export class S3Module {}
