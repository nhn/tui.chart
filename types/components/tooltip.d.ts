import { Point } from '../options';

export type TooltipDataValue = string | number | Point | ({ r: number } & Point);

interface TooltipData {
  label: string;
  color: string;
  value: TooltipDataValue;
  category?: string;
}

export type TooltipInfo = {
  data: TooltipData;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
  category?: string;
} & Point;
