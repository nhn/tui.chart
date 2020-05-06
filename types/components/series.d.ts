import { Point, Rect, BezierPoint } from '../options';
import { CircleStyleName } from '@src/brushes/basic';

export type StyleProp<T> = (T | CircleStyleName)[];

export interface CircleStyle {
  globalAlpha?: number;
  strokeStyle?: string;
  lineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export type CircleModel = {
  type: 'circle';
  radius: number;
  color: string;
  style?: StyleProp<CircleStyle>;
  detectionRadius?: number;
  seriesIndex: number;
} & Point;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: BezierPoint[];
  seriesIndex: number;
};

export type AreaPointsModel = Omit<LinePointsModel, 'type'> & {
  type: 'areaPoints';
  bottomYPoint: number;
  fillColor: string;
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
