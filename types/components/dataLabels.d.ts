import { Point, DataLabels, DataLabelStyle, DataLabelPieSeriesName } from '@t/options';
import { LabelStyleName } from '@src/brushes/label';

export type DataLabel = {
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  style: DataLabelStyle;
  styleName?: LabelStyleName[];
} & Point;

export type DataLabelStackTotal = {
  visible: boolean;
  style: Required<DataLabelStyle>;
};

export type DataLabelOption = Required<
  Pick<DataLabels, 'anchor' | 'offsetX' | 'offsetY' | 'formatter' | 'style'>
> & {
  stackTotal?: DataLabelStackTotal;
  pieSeriesName?: DataLabelPieSeriesName;
};
