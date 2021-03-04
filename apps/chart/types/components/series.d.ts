import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { TooltipData } from './tooltip';
import { LineModel, LabelModel } from './axis';
import { LegendData } from './legend';
import { TreemapSeriesData } from '../store/store';
import { BubbleDataLabel } from '../theme';
import { SectorStyle, SectorStyleName, CircleStyleName, RectStyleName } from '../brushes';

export type Nullable<T> = T | null;
export type StyleProp<T, K> = (T | K)[];
export type PointModel = Point & { value?: number; name?: string };

export interface CircleStyle {
  strokeStyle?: string;
  lineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export type ResponderModel =
  | CircleResponderModel
  | RectResponderModel
  | RectModel
  | BoxPlotResponderModel
  | SectorResponderModel
  | TreemapRectResponderModel
  | MarkerResponderModel
  | BulletResponderModel
  | RadialBarResponderModel;

export type TreemapSeriesModels = { series: TreemapRectModel[]; layer: TreemapRectModel[] };

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
  name?: string;
  borderWidth?: number;
  borderColor?: string;
} & Point;

export type CircleResponderModel = {
  detectionSize?: number;
  data: TooltipData;
} & CircleModel;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: (BezierPoint | null)[];
  name?: string;
  seriesIndex?: number;
  dashSegments?: number[];
  distances?: number[];
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
  lineWidth?: number;
} & Rect;

export type RectStyle = {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
};

export type RectModel = {
  type: 'rect';
  color: string;
  borderColor?: string;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
  value?: BoxSeriesDataType;
  name?: string;
  index?: number;
} & Rect;

export type TreemapRectModel = {
  type: 'rect';
  color: string;
  colorRatio?: number;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
} & Rect &
  TreemapSeriesData;

export type HeatmapRectModels = {
  series: HeatmapRectModel[];
};

export type HeatmapRectModel = {
  type: 'rect';
  name: string;
  color: string;
  colorRatio: number;
  colorValue: number | null;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness: number;
} & Rect;

export type HeatmapRectResponderModel = HeatmapRectModel & {
  data?: { name?: string } & Partial<TooltipData>;
};

export type TreemapRectResponderModel = Omit<TreemapRectModel, 'data'> & {
  index?: number;
  data?: Partial<TooltipData>;
} & Rect;

export type RectResponderModel = Partial<RectModel> & {
  type: 'rect';
  index?: number;
  data?: { name?: string } & Partial<TooltipData>;
  label?: string;
} & Rect &
  Partial<LegendData>;

export type AreaSeriesModels = {
  rect: ClipRectAreaModel[];
  series: (AreaPointsModel | LinePointsModel)[];
  dot: CircleModel[];
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

export type ScatterSeriesModels = {
  series: ScatterSeriesModel[];
};

export type LineSeriesModels = {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  dot: CircleModel[];
};

export type StackTotalModel = Omit<RectModel, 'type' | 'color'> & {
  type: 'stackTotal';
  theme: BubbleDataLabel;
};

export type PieSeriesModels = Record<string, SectorModel[]>;

export type SectorModel = {
  type: 'sector';
  color: string;
  degree: {
    start: number;
    end: number;
  };
  radius: {
    inner: number;
    outer: number;
  };
  name?: string;
  value?: number;
  style?: StyleProp<SectorStyle, SectorStyleName>;
  clockwise: boolean;
  drawingStartAngle: number;
  totalAngle: number;
  alias?: string;
  percentValue?: number;
  index?: number;
  seriesColor?: string;
  seriesIndex?: number;
  lineWidth?: number;
} & Point;

export type SectorResponderModel = {
  data: TooltipData;
} & SectorModel;

type GroupedSectorResponderModel = Pick<
  SectorModel,
  'type' | 'x' | 'y' | 'degree' | 'radius' | 'name' | 'clockwise' | 'index'
>;

type RadialBarResponderModel = SectorResponderModel | GroupedSectorResponderModel;

export type PolygonModel = {
  type: 'polygon';
  points: Point[];
  color: string;
  lineWidth: number;
  fillColor?: string;
  distances?: number[];
  name?: string;
  dashSegments?: number[];
};

export type RadarSeriesModels = {
  area: AreaPointsModel[];
  line: LinePointsModel[];
  dot: CircleModel[];
};

export type BoxPlotSeriesModel = RectModel | LineModel | CircleModel;
export type BoxPlotResponderTypes =
  | BoxPlotResponderModel
  | CircleResponderModel
  | RectResponderModel;

export type BoxPlotSeriesModels = {
  rect: RectModel[];
  line: LineModel[];
  circle: CircleModel[];
};

export type LineResponderModel = {
  detectionSize?: number;
} & LineModel;

export type BoxPlotModel = {
  type: 'boxPlot';
  color: string;
  name: string;
  rect: RectModel | null;
  median: LineModel | null;
  upperWhisker: LineModel | null;
  lowerWhisker: LineModel | null;
  minimum: LineModel | null;
  maximum: LineModel | null;
  index?: number;
  boxPlotDetection: { x: number; width: number };
};

export type BoxPlotResponderModel = {
  data?: TooltipData;
} & BoxPlotModel &
  Point;

export type BulletRectModel = {
  modelType: 'bullet' | 'range';
  seriesColor?: string;
  tooltipColor?: string;
} & RectModel;

export type BulletLineModel = LineModel & {
  seriesColor?: string;
  tooltipColor?: string;
  value: number;
};

type BulletModel = BulletRectModel | BulletLineModel;

export type MarkerResponderModel = {
  data?: TooltipData;
} & LineModel &
  LineResponderModel;

export type BulletRectResponderModel = {
  data?: TooltipData;
} & BulletModel;

export type BulletResponderModel =
  | RectResponderModel
  | BulletRectResponderModel
  | MarkerResponderModel;

export type BulletSeriesModels = {
  range: BulletRectModel[];
  bullet: BulletRectModel[];
  marker: BulletLineModel[];
};
export interface MouseEventType {
  responders: CircleResponderModel[] | RectResponderModel[];
  mousePosition: Point;
}

export type NestedPieSeriesModels = Record<string, SectorModel[]> & {
  selectedSeries: SectorModel[];
};

export type ScatterSeriesIconType =
  | 'circle'
  | 'rect'
  | 'triangle'
  | 'pentagon'
  | 'star'
  | 'diamond'
  | 'cross'
  | 'hexagon';

export interface ScatterSeriesModel {
  type: 'scatterSeries';
  iconType: ScatterSeriesIconType;
  x: number;
  y: number;
  borderColor: string;
  borderWidth: number;
  fillColor: string;
  size: number;
  index?: number;
  seriesIndex?: number;
  name?: string;
}

export type NoDataTextModel = LabelModel[];

export type BackgroundModel = RectModel[];

export type RadiusRange = { inner: number; outer: number };
