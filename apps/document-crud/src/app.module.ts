import { Module } from '@nestjs/common';
import { config } from './config';
import { MongooseModule, MongooseModuleFactoryOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import { TemplateModule } from './templates/templates.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Config } from './config';
import { OrpcClientModule } from '@auto-document/nest/orpc-client.module';
import { ORPCModule, onError } from '@orpc/nest';
import { FileStorageModule } from '@auto-document/nest/file.module';
import { rootClient } from './orpc';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config],
    }),
    FileStorageModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const mongoOptions = configService.get<Config>('mongo')! as MongooseModuleFactoryOptions;
        return mongoOptions;
      },
    }),
    OrpcClientModule.forRoot(rootClient),
    ORPCModule.forRoot({
      interceptors: [
        onError(error => {
          console.error(error);
        }),
      ],
    }),
    TemplateModule,
    DocumentsModule,
  ],
})
export class AppModule {}
