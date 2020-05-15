import { Point, Rect, BezierPoint, ConnectorLineType } from '../options';
import { CircleStyleName } from '@src/brushes/basic';
import { RectStyleName } from '@src/brushes/boxSeries';
import { LineModel } from './axis';

export type StyleProp<T, K> = (T | K)[];

export interface CircleStyle {
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
  style?: StyleProp<CircleStyle, CircleStyleName>;
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

export interface RectStyle {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
}

export type RectModel = {
  type: 'rect';
  color: string;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
} & Rect;
