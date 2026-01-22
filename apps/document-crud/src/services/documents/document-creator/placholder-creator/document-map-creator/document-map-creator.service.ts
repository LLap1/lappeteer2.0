import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import { featureCollection } from '@turf/helpers';
import bbox from '@turf/bbox';
import type { Feature, Geometry } from 'geojson';
import type { GeoJsonStyleOptions } from '@auto-document/domain/document-crud.schema';
import { type BBox } from 'src/services/wms/wms.model';
import { WmsService } from 'src/services/wms/wms.service';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

type GeoJsonFeature = Feature<Geometry, { style?: GeoJsonStyleOptions } | null>;

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  constructor(private readonly wmsService: WmsService) {}

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    const maps = await Promise.all(request.map(params => this.createMap(params)));
    return maps;
  }

  private async createMap(params: CreateMapsInput[number]): Promise<CreateMapsOutput[number]> {
    const { id, width, height, geojson, overlayId } = params;
    const bboxCoords = this.calculateBboxFromGeojson(geojson);

    const { imagePath: baseMapPath } = await this.wmsService.getMap({
      overlayId,
      format: "png",
      bbox: bboxCoords,
      width,
      height,
    });

    const polygonOverlayPaths = await Promise.all(
      geojson.map(feature => this.createPolygonOverlay(feature, bboxCoords, width, height)),
    );

    return {
      id,
      imagePaths: [baseMapPath, ...polygonOverlayPaths],
    };
  }

  private calculateBboxFromGeojson(geojson: GeoJsonFeature[]): BBox {
    const features = featureCollection<Geometry, { style?: GeoJsonStyleOptions } | null>(geojson);
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

  private latLngToPixel(
    lat: number,
    lng: number,
    bbox: BBox,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const x = ((lng - bbox.minX) / (bbox.maxX - bbox.minX)) * width;
    const y = ((bbox.maxY - lat) / (bbox.maxY - bbox.minY)) * height;
    return { x, y };
  }

  private drawPolygonOnCanvas(
    ctx: CanvasRenderingContext2D,
    coordinates: number[][],
    bbox: BBox,
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

  private colorToRgba(color: string, alpha: number): string {
    const namedColors: Record<string, [number, number, number]> = {
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      yellow: [255, 255, 0],
      orange: [255, 165, 0],
      purple: [128, 0, 128],
      pink: [255, 192, 203],
      cyan: [0, 255, 255],
      black: [0, 0, 0],
      white: [255, 255, 255],
      gray: [128, 128, 128],
      grey: [128, 128, 128],
      brown: [165, 42, 42],
      magenta: [255, 0, 255],
      lime: [0, 255, 0],
      navy: [0, 0, 128],
      teal: [0, 128, 128],
      maroon: [128, 0, 0],
      olive: [128, 128, 0],
      aqua: [0, 255, 255],
    };

    const lowerColor = color.toLowerCase();
    if (namedColors[lowerColor]) {
      const [r, g, b] = namedColors[lowerColor];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
      }
    }

    return `rgba(255, 0, 0, ${alpha})`;
  }

  private async createPolygonOverlay(
    feature: GeoJsonFeature,
    bbox: BBox,
    width: number,
    height: number,
  ): Promise<string> {
    const canvas = createCanvas(Math.round(width), Math.round(height));
    const ctx = canvas.getContext('2d');

    const style = feature.properties?.style;
    const strokeColor = style?.color || '#FF0000';
    const fillColor = style?.fillColor || '#FF0000';
    const strokeOpacity = style?.opacity ?? 1;
    const fillOpacity = style?.fillOpacity ?? 0.2;
    const lineWidth = style?.weight || 2;

    ctx.strokeStyle = this.colorToRgba(strokeColor, strokeOpacity);
    ctx.fillStyle = this.colorToRgba(fillColor, fillOpacity);
    ctx.lineWidth = lineWidth;

    const geometry = feature.geometry;
    if (geometry) {
      if (geometry.type === 'Point') {
        const [lng, lat] = geometry.coordinates as [number, number];
        const { x, y } = this.latLngToPixel(lat, lng, bbox, width, height);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (geometry.type === 'Polygon') {
        const coordinates = (geometry.coordinates as number[][][])[0];
        this.drawPolygonOnCanvas(ctx, coordinates, bbox, width, height);
        ctx.fill();
        ctx.stroke();
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates as number[][][][]) {
          const coordinates = polygon[0];
          this.drawPolygonOnCanvas(ctx, coordinates, bbox, width, height);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    const overlayBuffer = canvas.toBuffer('image/png');

    const tempDir = '/tmp';
    const outputPath = path.join(tempDir, `map-overlay-${uuidv4()}.png`);
    await Bun.write(outputPath, overlayBuffer);

    return outputPath;
  }
}
