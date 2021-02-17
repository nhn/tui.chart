import { BubblePoint, Point, RangeDataType } from '../options';
import { RadiusRange } from './series';

export type TooltipTitleValues = {
  title: string;
  value: TooltipDataValue;
  formattedValue?: string;
  color?: string;
}[];
export type TooltipValue = string | number | BubblePoint | Point | RangeDataType<number>;
export type TooltipDataValue = TooltipValue | TooltipTitleValues;

type TooltipTemplateType = 'boxPlot' | 'bullet' | 'pie' | 'heatmap';

export type TooltipData = {
  label: string;
  color: string;
  value: TooltipDataValue;
  formattedValue?: string;
  category?: string;
  templateType?: TooltipTemplateType;
  rootParentName?: string;
  percentValue?: number;
  index?: number;
  seriesIndex?: number;
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
  | 'radial'
  | 'bullet';
