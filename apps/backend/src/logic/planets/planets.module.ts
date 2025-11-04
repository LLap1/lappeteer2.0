import { Module } from "@nestjs/common";
import { PlanetService } from "src/logic/planets/planets.service";

@Module({
  providers: [PlanetService],
})
export class PlanetModule {}
