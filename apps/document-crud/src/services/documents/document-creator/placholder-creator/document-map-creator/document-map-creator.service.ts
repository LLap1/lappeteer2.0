import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { featureCollection } from '@turf/helpers';
import bbox from '@turf/bbox';
import sharp from 'sharp';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { Feature, Geometry } from 'geojson';
import { PathOptions } from 'leaflet';

const WMS_BASE_URL = 'http://localhost:8080/geoserver/ne/wms';

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    const maps = await Promise.all(request.map(params => this.createMap(params)));
    return maps;
  }

  private async createMap(params: CreateMapsInput[number]): Promise<CreateMapsOutput[number]> {
    const { id, width, height, geojson } = params;

    const bboxCoords = this.calculateBboxFromGeojson(geojson);
    const wmsUrl = this.buildWmsUrl(bboxCoords, width, height);
    const baseMapPath = await this.fetchMapAsFile(wmsUrl);

    if (!geojson || geojson.length === 0) {
      return {
        id,
        layerDataUrls: [baseMapPath],
      };
    }

    const compositeMapPath = await this.addPolygonsToMap(baseMapPath, geojson, bboxCoords, width, height);

    return {
      id,
      layerDataUrls: [compositeMapPath],
    };
  }

  private calculateBboxFromGeojson(geojson: Feature<Geometry, { style: PathOptions }>[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    const features = featureCollection(geojson);
    const [minX, minY, maxX, maxY] = bbox(features);

    const paddingPercent = 0.1;
    const widthPadding = (maxX - minX) * paddingPercent;
    const heightPadding = (maxY - minY) * paddingPercent;

    return {
      minX: minX - widthPadding,
      minY: minY - heightPadding,
      maxX: maxX + widthPadding,
      maxY: maxY + heightPadding,
    };
  }

  private buildWmsUrl(
    bbox: { minX: number; minY: number; maxX: number; maxY: number },
    width: number,
    height: number,
  ): string {
    const params = new URLSearchParams({
      VERSION: '1.3.0',
      SERVICE: 'WMS',
      REQUEST: 'GetMap',
      LAYERS: 'ne:world',
      STYLES: '',
      CRS: 'EPSG:4326',
      BBOX: `${bbox.minY},${bbox.minX},${bbox.maxY},${bbox.maxX}`,
      WIDTH: String(Math.round(width)),
      HEIGHT: String(Math.round(height)),
      FORMAT: 'image/png',
    });

    return `${WMS_BASE_URL}?${params.toString()}`;
  }

  private async fetchMapAsFile(url: string): Promise<string> {
    const response = await fetch(url);
    const tempDir = '/tmp';
    const filePath = path.join(tempDir, `map-${uuidv4()}.png`);
    await Bun.write(filePath, await response.arrayBuffer());
    return filePath;
  }

  private latLngToPixel(
    lat: number,
    lng: number,
    bbox: { minX: number; minY: number; maxX: number; maxY: number },
    ImagePixelWidth: number,
    ImagePixelHeight: number,
  ): { x: number; y: number } {


    const overlrayGeoXLength = bbox.maxX - bbox.minX
    const overlrayGeoYLength = bbox.maxY - bbox.minY
    const pixelGeoXLocation = lng - bbox.minX
    const pixelGeoYLocation = bbox.maxY - lat 

    const x = (pixelGeoXLocation / overlrayGeoXLength) * ImagePixelWidth;
    const y = (pixelGeoYLocation / overlrayGeoYLength) * ImagePixelHeight;
    return { x, y };
  }

  private drawPolygonOnCanvas(
    ctx: CanvasRenderingContext2D,
    coordinates: number[][],
    bbox: { minX: number; minY: number; maxX: number; maxY: number },
    width: number,
    height: number,
  ): void {
    ctx.beginPath();
    coordinates.forEach((coord, index) => {
      const [lng, lat] = coord;
      const { x, y } = this.latLngToPixel(lat, lng, bbox, width, height);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
  }

  private async addPolygonsToMap(
    baseMapPath: string,
    geojson: Feature<Geometry, { style: PathOptions }>[],
    bbox: { minX: number; minY: number; maxX: number; maxY: number },
    width: number,
    height: number,
  ): Promise<string> {
    const canvas = createCanvas(Math.round(width), Math.round(height));
    const ctx = canvas.getContext('2d');

    for (const feature of geojson) {
      ctx.strokeStyle = feature.properties.style.color || '#FF0000';
      
      const geometry = feature.geometry;
      if (!geometry) continue;

      if (geometry.type === 'Point') {
        const [lng, lat] = geometry.coordinates;
        const { x, y } = this.latLngToPixel(lat, lng, bbox, width, height);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI); // Draw a small circle for the point
        ctx.fill();
        ctx.stroke();
      } else if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates[0];
        this.drawPolygonOnCanvas(ctx, coordinates, bbox, width, height);
        ctx.fill();
        ctx.stroke();
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          const coordinates = polygon[0];
          this.drawPolygonOnCanvas(ctx, coordinates, bbox, width, height);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    const overlayBuffer = canvas.toBuffer('image/png');

    const compositeImage = await sharp(baseMapPath)
      .composite([{ input: overlayBuffer }])
      .png()
      .toBuffer();

    const tempDir = '/tmp';
    const outputPath = path.join(tempDir, `map-composite-${uuidv4()}.png`);
    await Bun.write(outputPath, compositeImage);

    return outputPath;
  }
}
