import { Point, DataLabels, DataLabelStyle, DataLabelPieSeriesName } from '@t/options';

export type DataLabelType = 'stackTotal' | 'rect' | 'point' | 'sector' | 'pieSeriesName';

export type DataLabel = {
  type: DataLabelType;
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  fillColor?: string;
} & Point;

export type DataLabelStackTotal = {
  visible: boolean;
  style: Required<DataLabelStyle>;
};

export type DataLabelOption = Required<
  Pick<DataLabels, 'anchor' | 'offsetX' | 'offsetY' | 'formatter'>
> & {
  style?: DataLabelStyle;
  stackTotal?: DataLabelStackTotal;
  pieSeriesName?: DataLabelPieSeriesName;
};

export type DataLabelModel = {
  type: 'dataLabel';
  dataLabelType: DataLabelType;
  text: string;
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  font?: string;
  fillStyle?: string;
  strokeStyle?: string;
  opacity?: number;
};
