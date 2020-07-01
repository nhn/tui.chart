import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { CircleStyleName } from '@src/brushes/basic';
import { RectStyleName } from '@src/brushes/boxSeries';
import { TooltipData } from '@t/components/tooltip';

export type Nullable<T> = T | null;
export type StyleProp<T, K> = (T | K)[];
export type PointModel = Point & { value?: number };
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
  seriesIndex?: number;
} & Point;

export type CircleResponderModel = {
  detectionRadius?: number;
  data: TooltipData;
} & CircleModel;

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
  borderColor?: string;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
  value?: BoxSeriesDataType;
} & Rect;
