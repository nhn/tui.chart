import { Point } from '../options';

interface TooltipData {
  label: string;
  color: string;
  value: string | number | [number, number];
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
