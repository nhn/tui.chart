import { Point } from '../options';
import { StyleProp } from '@t/components/series';
import { LabelStyleName } from '@src/brushes/basic';

interface LabelStyle {
  font?: string;
  fillStyle?: 'string';
  textAlign?: 'left' | 'right' | 'center';
  textBaseline?: 'middle' | 'bottom' | 'top' | 'alphabetic' | 'hanging';
}

export type LabelModel = {
  type: 'label';
  style?: StyleProp<LabelStyle, LabelStyleName>;
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
} & Point;
