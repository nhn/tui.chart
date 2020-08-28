import { BubblePoint, Point, RangeDataType } from '../options';
import { RadiusRange } from '@src/component/pieSeries';

export type TooltipTitleValues = {
  title: string;
  value: TooltipDataValue;
  formattedValue?: string;
}[];
export type TooltipValue = string | number | BubblePoint | Point | RangeDataType;
export type TooltipDataValue = TooltipValue | TooltipTitleValues;

type TooltipTemplateType = 'boxPlot' | 'bullet';

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  formattedValue?: string;
  category?: string;
  templateType?: TooltipTemplateType;
};

export type TooltipInfo = {
  data: TooltipData;
  radius?: number | RadiusRange;
  width?: number;
  height?: number;
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

export type TooltipModelName =
  | 'line'
  | 'scatter'
  | 'bubble'
  | 'area'
  | 'boxPlot'
  | 'bar'
  | 'column'
  | 'pie'
  | 'radar'
  | 'radial';
