import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { CircleStyleName } from '@src/brushes/basic';
import { RectStyleName } from '@src/brushes/boxSeries';
import { TooltipData } from '@t/components/tooltip';
import { LineModel, LabelModel } from '@t/components/axis';

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
  index?: number;
} & Point;

export type BoundResponderModel = Rect & { type: 'bound'; index?: number };

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

export type AreaSeriesModels = {
  rect: ClipRectAreaModel[];
  series: AreaPointsModel[];
  hoveredSeries: (CircleModel | LinePointsModel)[];
};

export type BoxSeriesModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  hoveredSeries?: RectModel[];
  connector?: LineModel[];
  label?: LabelModel[];
};

export type CircleSeriesModels = {
  series: CircleModel[];
  hoveredSeries: CircleModel[];
};

export type LineSeriesModels = {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  hoveredSeries: CircleModel[];
};

export type StackTotalModel = Omit<RectModel, 'type' | 'color'> & {
  type: 'stackTotal';
};
