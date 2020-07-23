import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { CircleStyleName, RectStyleName } from '@src/brushes/basic';
import { TooltipData } from '@t/components/tooltip';
import { LineModel, LabelModel } from '@t/components/axis';
import { SectorStyle, SectorStyleName } from '@src/brushes/sector';

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
  angle?: {
    start: number;
    end: number;
  };
} & Point;

type BoundResponderModelData = { name?: string; value?: string };

export type BoundResponderModel = Rect & {
  type: 'bound';
  index?: number;
  data?: BoundResponderModelData;
};

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
  name: string;
  seriesIndex?: number;
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
};

export type BoxSeriesModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  connector?: LineModel[];
  label?: LabelModel[];
};

export type CircleSeriesModels = {
  series: CircleModel[];
};

export type LineSeriesModels = {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
};

export type StackTotalModel = Omit<RectModel, 'type' | 'color'> & {
  type: 'stackTotal';
};

export type PieSeriesModels = {
  series: SectorModel[];
};

export type SectorModel = {
  type: 'sector';
  color: string;
  startDegree: number;
  endDegree: number;
  radius: number;
  name: string;
  value?: number;
  style?: StyleProp<SectorStyle, SectorStyleName>;
} & Point;

export type SectorResponderModel = {
  data: TooltipData;
  seriesIndex: number;
} & SectorModel;
