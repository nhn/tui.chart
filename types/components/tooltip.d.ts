import { ObjectDatetimePoint, Point } from '../options';

export type TooltipDataValue =
  | string
  | number
  | ObjectDatetimePoint
  | ({ r: number } & ObjectDatetimePoint);

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  category?: string;
};

export type TooltipInfo = {
  data: TooltipData;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
  category?: string;
} & Point;
