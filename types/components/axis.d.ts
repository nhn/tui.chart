import { Point } from '../options';
import { StyleProp } from '@t/components/series';
import { StrokeLabelStyleName, StrokeLabelStyle, LabelStyleName } from '@src/brushes/label';

interface LabelStyle {
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
} & Point;

export type TickModel = {
  type: 'tick';
  isYAxis: boolean;
} & Point;

export type LineModel = {
  type: 'line';
  x2: number;
  y2: number;
  strokeStyle?: string;
  lineWidth?: number;
  dashedPattern?: number[];
} & Point;
