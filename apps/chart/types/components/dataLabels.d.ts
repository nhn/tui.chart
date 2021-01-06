import {
  Point,
  DataLabelOptions,
  DataLabelPieSeriesName,
  StackTotalDataLabel,
  BoxSeriesDataType,
} from '@t/options';
import { PointModel, SectorModel, RectModel, Nullable } from './series';
import { LineModel } from './axis';
import { PieDataLabelTheme, CalloutTheme, BoxDataLabel, BubbleDataLabel } from '@t/theme';

export type DataLabelSeriesType = 'area' | 'line' | 'bar' | 'column' | 'bullet' | 'pie';

export type DataLabelType =
  | 'stackTotal'
  | 'rect'
  | 'point'
  | 'sector'
  | 'line'
  | 'pieSeriesName'
  | 'treemapSeriesName';

type DataLabelData = {
  data: DataLabel[];
  options: DataLabelOptions;
};

export type DataLabelsMap = {
  [key in DataLabelSeriesType]?: DataLabelData;
};

export type DataLabel = {
  type: DataLabelType;
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  callout?: Nullable<Callout>;
  name?: string;
  seriesColor?: string;
  theme: BubbleDataLabel | BoxDataLabel;
} & Point;

export type DataLabelOption = Required<
  Pick<DataLabelOptions, 'anchor' | 'offsetX' | 'offsetY' | 'formatter'>
> & {
  stackTotal?: Required<StackTotalDataLabel>;
  pieSeriesName?: DataLabelPieSeriesName;
};

export type DataLabelModel = {
  type: 'dataLabel';
  dataLabelType: DataLabelType;
  opacity?: number;
} & Omit<DataLabel, 'type'>;

export type DataLabelModels = { series: DataLabelModel[]; total: DataLabelModel[] };

export type PointDataLabel = PointModel & {
  type: 'point';
  theme: BubbleDataLabel;
};
export type RadialDataLabel = Omit<SectorModel, 'type'> & {
  type: 'sector';
  theme: PieDataLabelTheme;
};
export type RectDirection = 'top' | 'bottom' | 'left' | 'right';

export type RectDataLabel = Omit<RectModel, 'type' | 'color' | 'value'> & {
  value?: BoxSeriesDataType | string;
  type: 'rect' | 'stackTotal' | 'treemapSeriesName';
  direction: RectDirection;
  plot: {
    x: number;
    y: number;
    size: number;
  };
  modelType?: string;
  color?: string;
  theme: BubbleDataLabel | BoxDataLabel;
};

export type LineDataLabel = LineModel & {
  value: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  theme: BubbleDataLabel;
};

export type Callout = Point & { x2: number; y2: number; theme: CalloutTheme };
export type SeriesDataLabelType = PointDataLabel | RadialDataLabel | RectDataLabel | LineDataLabel;

export type SeriesDataLabels = Array<SeriesDataLabelType>;

export type RadialAnchor = 'center' | 'outer';
