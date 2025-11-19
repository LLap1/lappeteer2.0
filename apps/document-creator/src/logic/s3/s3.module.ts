import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Client } from 'bun';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        const s3ClientConfig = configService.get<Config['s3']>('s3')!;
        return new S3Client(s3ClientConfig);
      },
      inject: [ConfigService],
    },
    S3Service,
  ],

  exports: [S3Service],
})
export class S3Module {}
