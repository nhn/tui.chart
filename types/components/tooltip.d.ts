import { BubblePoint, Point } from '../options';
import { RadiusRange } from '@src/component/pieSeries';

export type TooltipTitleValues = { title: string; value: number }[];
export type TooltipValue = string | number | BubblePoint | Point;
export type TooltipDataValue = TooltipValue | TooltipTitleValues;

type TooltipTemplateType = 'boxPlot';

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  formattedValue?: string;
  category?: string;
};

export type TooltipInfo = {
  data: TooltipData;
  radius?: number | RadiusRange;
  width?: number;
  height?: number;
  templateType?: TooltipTemplateType;
} & Point;

export type TooltipModel = {
  type: 'tooltip';
  data: TooltipData[];
  category?: string;
  target: {
    radius: number;
    width: number;
    height: number;
  };
  templateType?: TooltipTemplateType;
} & Point;
