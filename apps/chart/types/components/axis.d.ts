import { Point } from '../options';
import { StyleProp, PathRectModel } from '@t/components/series';
import { StrokeLabelStyleName, StrokeLabelStyle, LabelStyleName } from '@src/brushes/label';

export interface LabelStyle {
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type LabelModel = {
  type: 'label';
  style?: StyleProp<LabelStyle, LabelStyleName>;
  stroke?: StyleProp<StrokeLabelStyle, StrokeLabelStyleName>;
  text: string;
  opacity?: number;
  radian?: number;
} & Point;

export type TickModel = {
  type: 'tick';
  isYAxis: boolean;
  tickSize: number;
  strokeStyle: string;
  lineWidth: number;
} & Point;

export type LineModel = {
  type: 'line';
  x2: number;
  y2: number;
  strokeStyle?: string;
  lineWidth?: number;
  dashSegments?: number[];
  name?: string;
} & Point;

export type AxisModels = {
  label: LabelModel[];
  tick: TickModel[];
  axisLine: LineModel[];
};

export type RectLabelModel = {
  type: 'rectLabel';
  borderRadius?: number;
  backgroundColor?: string;
} & Omit<PathRectModel, 'type'> &
  Omit<LabelModel, 'type'>;
