import { Point, Rect } from '../options';

export type CircleModel = {
  type: 'circle';
  color: string;
  radius: number;
} & Point;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: Point[];
  spline?: boolean;
};

export type PathRectModel = {
  type: 'pathRect';
  radius?: number;
  fill?: string;
  stroke?: string;
} & Rect;
