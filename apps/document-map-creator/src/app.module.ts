import { Module } from '@nestjs/common';
import { DocumentMapCreatorModule } from './services/document-map-creator.module';
import { config } from './config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DocumentMapCreatorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
  ],
})
export class AppModule {}
