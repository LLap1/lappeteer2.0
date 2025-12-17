import { Module } from '@nestjs/common';
import { DocumentProcessorModule } from './services/document-processor.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config, config } from './config';
import { LoggerModule } from '@auto-document/nest/logger.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const loggerConfig = configService.get<Config['logger']>('logger')?.pino!;
        return loggerConfig;
      },
    }),
    DocumentProcessorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
  ],
})
export class AppModule {}
