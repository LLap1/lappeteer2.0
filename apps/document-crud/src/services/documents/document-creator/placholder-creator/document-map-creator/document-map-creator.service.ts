import { Injectable, Logger } from '@nestjs/common';
import type { CreateMapsInput, CreateMapsOutput, ImageLayer } from './document-map-creator.model';
import { Log } from '@auto-document/utils/log';
import { featureCollection } from '@turf/helpers';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import type { Feature, Geometry } from 'geojson';
import { type BBox } from 'src/services/wms/wms.model';
import { WmsService } from 'src/services/wms/wms.service';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PathOptions } from 'leaflet';
import { OverlaysService } from 'src/services/wms/overlays/overlays.service';
import sharp from 'sharp';




type GeoJsonFeature = Feature<Geometry, { style?: PathOptions; text?: string } | null>;

type CropInfo = {
  cropBbox: BBox;
  canvasWidth: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
};

@Injectable()
export class DocumentMapCreatorService {
  private static readonly logger: Logger = new Logger(DocumentMapCreatorService.name);

  constructor(private readonly wmsService: WmsService, private readonly overlaysService: OverlaysService) {}

  @Log(DocumentMapCreatorService.logger)
  async create(request: CreateMapsInput): Promise<CreateMapsOutput> {
    return Promise.all(request.map(params => this.createMap(params)));
  }

  private async createMap(params: CreateMapsInput[number]): Promise<CreateMapsOutput[number]> {
    const { id, width, height, geojson, overlayId, rotation = 0 } = params;
    const pixelGeometries = await Promise.all(geojson.map(async feature => {
      const pixelGeometry = await this.overlaysService.groundToImage({
        overlayId,
        geometry: feature.geometry,
      });
      return {
        ...feature,
        geometry: pixelGeometry.geometry,
      };
    }));

    const cropBbox = this.calculateBboxFromGeojson(pixelGeometries);

    const needsRotation = rotation !== 0;
    const { fetchBbox, fetchWidth, fetchHeight } = needsRotation
      ? this.calculateExpandedBboxForRotation(cropBbox, width, height, rotation)
      : { fetchBbox: cropBbox, fetchWidth: width, fetchHeight: height };

    const { imageFile } = await this.wmsService.getMap({
      overlayId,
      format: 'png',
      bbox: fetchBbox,
      width: fetchWidth,
      height: fetchHeight,
    });

    const baseLayerPath = needsRotation
      ? await this.rotateAndCropImage(imageFile.name!, rotation, width, height)
      : imageFile.name!;

    const baseLayer: ImageLayer = {
      path: baseLayerPath,
      offsetX: 0,
      offsetY: 0,
      width,
      height,
    };

    const polygonLayers = await Promise.all(
      pixelGeometries.map(feature => this.createPolygonOverlay(feature, cropBbox, width, height)),
    );

    return { id, layers: [baseLayer, ...polygonLayers] };
  }

  private calculateBboxFromGeojson(geojson: GeoJsonFeature[]): BBox {
    const features = featureCollection<Geometry, { style?: PathOptions } | null>(geojson);
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

  private calculateExpandedBboxForRotation(
    bbox: BBox,
    targetWidth: number,
    targetHeight: number,
    rotationDegrees: number,
  ): { fetchBbox: BBox; fetchWidth: number; fetchHeight: number } {
    const radians = (Math.abs(rotationDegrees) * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));

    const expandedWidth = targetWidth * cos + targetHeight * sin;
    const expandedHeight = targetWidth * sin + targetHeight * cos;

    const scaleFactor = Math.max(expandedWidth / targetWidth, expandedHeight / targetHeight);

    const bboxWidth = bbox.maxX - bbox.minX;
    const bboxHeight = bbox.maxY - bbox.minY;
    const bboxCenterX = (bbox.minX + bbox.maxX) / 2;
    const bboxCenterY = (bbox.minY + bbox.maxY) / 2;

    const expandedBboxWidth = bboxWidth * scaleFactor;
    const expandedBboxHeight = bboxHeight * scaleFactor;

    return {
      fetchBbox: {
        minX: bboxCenterX - expandedBboxWidth / 2,
        minY: bboxCenterY - expandedBboxHeight / 2,
        maxX: bboxCenterX + expandedBboxWidth / 2,
        maxY: bboxCenterY + expandedBboxHeight / 2,
      },
      fetchWidth: Math.ceil(targetWidth * scaleFactor),
      fetchHeight: Math.ceil(targetHeight * scaleFactor),
    };
  }

  private async rotateAndCropImage(
    imagePath: string,
    rotationDegrees: number,
    targetWidth: number,
    targetHeight: number,
  ): Promise<string> {
    const outputPath = path.join('/tmp', `rotated-${uuidv4()}.png`);

    const image = sharp(imagePath);

    const rotatedImage = image.rotate(rotationDegrees, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    const rotatedMeta = await rotatedImage.clone().toBuffer({ resolveWithObject: true });
    const rotatedWidth = rotatedMeta.info.width;
    const rotatedHeight = rotatedMeta.info.height;

    const left = Math.floor((rotatedWidth - targetWidth) / 2);
    const top = Math.floor((rotatedHeight - targetHeight) / 2);

    await rotatedImage
      .extract({
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: Math.min(targetWidth, rotatedWidth),
        height: Math.min(targetHeight, rotatedHeight),
      })
      .resize(targetWidth, targetHeight, { fit: 'fill' })
      .toFile(outputPath);

    return outputPath;
  }

  private calculateCropInfo(
    feature: GeoJsonFeature,
    cropBbox: BBox,
    cropWidth: number,
    cropHeight: number,
    paddingPx: number,
  ): CropInfo {
    const [minLng, minLat, maxLng, maxLat] = bbox(feature);

    const mapGeoWidth = cropBbox.maxX - cropBbox.minX;
    const mapGeoHeight = cropBbox.maxY - cropBbox.minY;
    const pxPerLng = cropWidth / mapGeoWidth;
    const pxPerLat = cropHeight / mapGeoHeight;

    const geoPaddingLng = paddingPx / pxPerLng;
    const geoPaddingLat = paddingPx / pxPerLat;

    const cropGeoBbox: BBox = {
      minX: Math.max(cropBbox.minX, minLng - geoPaddingLng),
      minY: Math.max(cropBbox.minY, minLat - geoPaddingLat),
      maxX: Math.min(cropBbox.maxX, maxLng + geoPaddingLng),
      maxY: Math.min(cropBbox.maxY, maxLat + geoPaddingLat),
    };

    const canvasWidth = Math.round((cropGeoBbox.maxX - cropGeoBbox.minX) * pxPerLng);
    const canvasHeight = Math.round((cropGeoBbox.maxY - cropGeoBbox.minY) * pxPerLat);

    const offsetX = Math.round((cropGeoBbox.minX - cropBbox.minX) * pxPerLng);
    const offsetY = Math.round((cropBbox.maxY - cropGeoBbox.maxY) * pxPerLat);

    return {
      cropBbox: cropGeoBbox,
      canvasWidth: Math.max(1, canvasWidth),
      canvasHeight: Math.max(1, canvasHeight),
      offsetX,
      offsetY,
    };
  }

  private cropCoordToCanvasCoord(cropY: number, cropX: number, cropBbox: BBox, canvasWidth: number, canvasHeight: number): { canvasX: number; canvasY: number } {
    const canvasX = ((cropX - cropBbox.minX) / (cropBbox.maxX - cropBbox.minX)) * canvasWidth;
    const canvasY = ((cropBbox.maxY - cropY) / (cropBbox.maxY - cropBbox.minY)) * canvasHeight;
    return { canvasX, canvasY };
  }

  private async createPolygonOverlay(
    feature: GeoJsonFeature,
    cropBbox: BBox,
    mapWidth: number,
    mapHeight: number,
  ): Promise<ImageLayer> {
    const style = feature.properties?.style;
    const strokeColor = style?.color || '#FF0000';
    const fillColor = style?.fillColor || '#FF0000';
    const strokeOpacity = style?.opacity ?? 1;
    const fillOpacity = style?.fillOpacity ?? 0.2;
    const lineWidth = style?.weight || 2;
    const dashArray = style?.dashArray || undefined;

    const paddingPx = lineWidth + 3;
    const crop = this.calculateCropInfo(feature, cropBbox, mapWidth, mapHeight, paddingPx);

    const canvas = createCanvas(crop.canvasWidth, crop.canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = this.colorToRgba(strokeColor, strokeOpacity);
    ctx.fillStyle = this.colorToRgba(fillColor, fillOpacity);
    ctx.lineWidth = lineWidth;
    if (dashArray) {
      ctx.setLineDash(dashArray as number[]);
    }

    const geometry = feature.geometry;
    if (geometry) {
      this.drawGeometry(ctx, geometry, crop);

      const text = feature.properties?.text;
      if (text) {
        this.drawTextAtCenter(ctx, feature, crop, text, strokeColor);
      }
    }

    const overlayBuffer = canvas.toBuffer('image/png');
    const outputPath = path.join('/tmp', `map-overlay-${uuidv4()}.png`);
    await Bun.write(outputPath, overlayBuffer);

    return {
      path: outputPath,
      offsetX: crop.offsetX,
      offsetY: crop.offsetY,
      width: crop.canvasWidth,
      height: crop.canvasHeight,
    };
  }

  private drawGeometry(ctx: CanvasRenderingContext2D, geometry: Geometry, crop: CropInfo): void {
    const { cropBbox, canvasWidth, canvasHeight } = crop;

    if (geometry.type === 'Point') {
      const [cropX, cropY] = geometry.coordinates as [number, number];
      const { canvasX, canvasY } = this.cropCoordToCanvasCoord(cropY, cropX, cropBbox, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (geometry.type === 'Polygon') {
      const coordinates = (geometry.coordinates as number[][][])[0];
      this.drawPolygonPath(ctx, coordinates, crop);
      ctx.fill();
      ctx.stroke();
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates as number[][][][]) {
        this.drawPolygonPath(ctx, polygon[0], crop);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private drawPolygonPath(ctx: CanvasRenderingContext2D, coordinates: number[][], crop: CropInfo): void {
    const { cropBbox, canvasWidth, canvasHeight } = crop;

    ctx.beginPath();
    coordinates.forEach((coord, index) => {
      const [x, y] = coord;

      const {canvasX, canvasY} = this.cropCoordToCanvasCoord(y, x, cropBbox, canvasWidth, canvasHeight);

      if (index === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });
    ctx.closePath();
  }

  private drawTextAtCenter(
    ctx: CanvasRenderingContext2D,
    feature: GeoJsonFeature,
    crop: CropInfo,
    text: string,
    color: string,
  ): void {
    const { cropBbox, canvasWidth, canvasHeight } = crop;
    const center = centroid(feature as Feature<Geometry>);
    const [cropX, cropY] = center.geometry.coordinates;
    const { canvasX, canvasY } = this.cropCoordToCanvasCoord(cropY, cropX, cropBbox, canvasWidth, canvasHeight);

    const fontSize = Math.max(12, Math.min(canvasWidth, canvasHeight) / 10);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.strokeText(text, canvasX, canvasY);

    ctx.fillStyle = this.colorToRgba(color, 1);
    ctx.fillText(text, canvasX, canvasY);
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
}
