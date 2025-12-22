import { Module } from '@nestjs/common';
import { DocumentMapCreatorModule } from './services/document-map-creator.module';
import { config } from './config';
import { LoggerModule } from '@auto-document/nest/logger.module';

@Module({
  imports: [LoggerModule.forRoot(config.logger), DocumentMapCreatorModule],
})
export class AppModule {}
