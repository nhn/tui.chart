import {
  Point,
  DataLabelOptions,
  DataLabelStyle,
  DataLabelPieSeriesName,
  SubDataLabel,
} from '@t/options';

export type DataLabelType =
  | 'stackTotal'
  | 'rect'
  | 'point'
  | 'sector'
  | 'pieSeriesName'
  | 'treemapSeriesName';

export type DataLabel = {
  type: DataLabelType;
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  defaultColor?: string;
  name?: string;
} & Point;

export type DataLabelOption = Required<
  Pick<DataLabelOptions, 'anchor' | 'offsetX' | 'offsetY' | 'formatter'>
> & {
  style?: DataLabelStyle;
  stackTotal?: Required<SubDataLabel>;
  pieSeriesName?: DataLabelPieSeriesName;
};

export type DataLabelModel = {
  type: 'dataLabel';
  dataLabelType: DataLabelType;
  style?: DataLabelStyle;
  opacity?: number;
} & Omit<DataLabel, 'type'>;

export type DataLabelModels = { series: DataLabelModel[]; total: DataLabelModel[] };
