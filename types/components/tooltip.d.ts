import { Point } from '../options';

export type TooltipDataValue = string | number | Point | ({ r: number } & Point);

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  category?: string;
} & Partial<Point>;

export type TooltipInfo = {
  data: TooltipData;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
  category?: string;
} & Point;
