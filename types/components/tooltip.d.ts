import { BubblePoint, Point } from '../options';
import { RadiusRange } from '@src/component/pieSeries';

export type TooltipTitleValues = { title: string; value: number }[];
export type TooltipDataValue = string | number | BubblePoint | Point | TooltipTitleValues;

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  category?: string;
};

export type TooltipInfo = {
  data: TooltipData;
  radius?: number | RadiusRange;
  width?: number;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
  category?: string;
  target: {
    radius: number;
    width: number;
  };
} & Point;
