import { Point } from '../options';

export type LabelModel = {
  type: 'label';
  align: 'left' | 'center';
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
