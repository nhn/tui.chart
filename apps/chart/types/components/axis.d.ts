import { Point } from '../options';
import { LabelModel } from '@t/brush/label';

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
