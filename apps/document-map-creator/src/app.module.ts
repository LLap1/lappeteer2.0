import { Module } from '@nestjs/common';
import { DocumentMapCreatorModule } from './services/document-map-creator.module';
import { Config, config } from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    DocumentMapCreatorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
  ],
})
export class AppModule {}
