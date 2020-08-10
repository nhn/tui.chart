import { PolygonModel } from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';

export type PolygonStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  fillStyle?: string;
};

export type PolygonStyleName = 'default';

export function polygon(ctx: CanvasRenderingContext2D, polygonModel: PolygonModel) {}
