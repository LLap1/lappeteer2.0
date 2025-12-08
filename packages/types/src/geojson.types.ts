import { z } from 'zod';
import type { Feature, Geometry, GeoJsonProperties, Position } from 'geojson';
import type { PathOptions } from 'leaflet';

export const GeoJsonFeatureTypeSchema = z.enum([
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
]);

const PositionSchema = z.array(z.number()).min(2).max(3) as z.ZodType<Position>;

const PointCoordinatesSchema = PositionSchema;
const MultiPointCoordinatesSchema = z.array(PositionSchema);
const LineStringCoordinatesSchema = z.array(PositionSchema).min(2);
const MultiLineStringCoordinatesSchema = z.array(z.array(PositionSchema).min(2));
const PolygonCoordinatesSchema = z.array(z.array(PositionSchema).min(4));
const MultiPolygonCoordinatesSchema = z.array(z.array(z.array(PositionSchema).min(4)));

export const GeoJsonGeometrySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Point'),
    coordinates: PointCoordinatesSchema,
  }),
  z.object({
    type: z.literal('MultiPoint'),
    coordinates: MultiPointCoordinatesSchema,
  }),
  z.object({
    type: z.literal('LineString'),
    coordinates: LineStringCoordinatesSchema,
  }),
  z.object({
    type: z.literal('MultiLineString'),
    coordinates: MultiLineStringCoordinatesSchema,
  }),
  z.object({
    type: z.literal('Polygon'),
    coordinates: PolygonCoordinatesSchema,
  }),
  z.object({
    type: z.literal('MultiPolygon'),
    coordinates: MultiPolygonCoordinatesSchema,
  }),
]) as z.ZodType<Geometry>;

export const GeoJsonPropertiesSchema = z.object({
  style: z
    .object({
      color: z.string().optional(),
      fillColor: z.string().optional(),
      weight: z.number().optional(),
      opacity: z.number().optional(),
      fillOpacity: z.number().optional(),
    })
    .strict(),
}) as z.ZodType<{ style?: PathOptions }>;

export const GeoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: GeoJsonGeometrySchema.or(z.null()),
  properties: GeoJsonPropertiesSchema,
}) as z.ZodType<Feature<Geometry | null, GeoJsonProperties>>;
