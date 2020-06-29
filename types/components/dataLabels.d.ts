import { Point, DataLabels, DataLabelStyle } from '@t/options';

export type DataLabelType = 'horizontal' | 'vertical' | 'radial';

export type DataLabel = {
  text: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  style: DataLabelStyle;
} & Point;

export type DataLabelStackTotal = {
  visible: boolean;
  style: Required<DataLabelStyle>;
};

export type DataLabelOption = Required<
  Pick<DataLabels, 'anchor' | 'offsetX' | 'offsetY' | 'formatter' | 'style'>
> & {
  stackTotal?: DataLabelStackTotal;
};
