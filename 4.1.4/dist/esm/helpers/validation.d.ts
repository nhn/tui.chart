import { SelectSeriesInfo } from "../../types/charts";
import { BoxTypeEventDetectType, LineTypeEventDetectType } from "../../types/options";
export declare function isAvailableShowTooltipInfo(info: SelectSeriesInfo, eventDetectType: LineTypeEventDetectType | BoxTypeEventDetectType, targetChartType: 'area' | 'line' | 'column' | 'radialBar'): boolean;
export declare function isAvailableSelectSeries(info: SelectSeriesInfo, targetChartType: 'area' | 'line' | 'column' | 'scatter'): boolean;
