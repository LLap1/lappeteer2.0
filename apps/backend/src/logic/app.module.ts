import { Module } from "@nestjs/common";
import { config } from "../config";
import { ConfigModule } from "@nestjs/config";
import { PlanetModule } from "src/logic/planets/planets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => config,
    }),

    PlanetModule,
  ],
})
export class AppModule {}
