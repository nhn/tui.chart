import { SelectSeriesInfo } from "../charts/chart";
import { BoxTypeEventDetectType, LineTypeEventDetectType } from "../../types/options";
export declare function isAvailableShowTooltipInfo(info: SelectSeriesInfo, eventDetectType: LineTypeEventDetectType | BoxTypeEventDetectType, targetChartType: 'area' | 'line' | 'column'): boolean;
export declare function isAvailableSelectSeries(info: SelectSeriesInfo, targetChartType: 'area' | 'line' | 'column' | 'scatter'): boolean;
