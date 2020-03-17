import { Point, Rect } from '../options';

interface TooltipData {
  label: string;
  color: string;
  value: string | number;
}

export type TooltipInfo = {
  data: TooltipData;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
} & Rect;
