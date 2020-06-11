import { Point } from '../options';

export type CircleLegendModel = {
  radius: number;
  value: number;
  type: 'circleLegend';
} & Point;
