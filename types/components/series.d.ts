import { Point, Rect, BezierPoint } from '../options';

export type CircleModel = {
  type: 'circle';
  style: {
    color: string;
    radius: number;
    globalAlpha?: number;
    strokeStyle?: string;
    lineWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetY?: number;
  };
} & Point;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: BezierPoint[];
};

export type PathRectModel = {
  type: 'pathRect';
  radius?: number;
  fill?: string;
  stroke?: string;
} & Rect;

export type BoxSeriesModel = {
  type: 'box';
  color: string;
} & Rect;

export type RectModel = {
  type: 'rect';
  color: string;
  offsetKey: 'x' | 'y';
} & Rect;
