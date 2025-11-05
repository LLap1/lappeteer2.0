import { Module } from '@nestjs/common';
import { config } from '../config';
import { ConfigModule } from '@nestjs/config';
import { DocumentCreatorModule } from './document-creator/document-creator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => config,
    }),
    DocumentCreatorModule,
  ],
})
export class AppModule {}
