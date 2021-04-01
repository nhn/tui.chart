import { ChartType, Legend, LegendIconType, Options, RawSeries, Series } from "../../types/store/store";
import { BubbleChartOptions, HeatmapChartOptions, TreemapChartOptions, GaugeChartOptions } from "../../types/options";
export declare type OptionsWithNormalLegendType = Exclude<Options, TreemapChartOptions | HeatmapChartOptions | GaugeChartOptions>;
export declare function getActiveSeriesMap(legend: Legend): {};
export declare function showCircleLegend(options: BubbleChartOptions): boolean;
export declare function showLegend(options: Options, series: Series | RawSeries): boolean;
export declare function showCheckbox(options: OptionsWithNormalLegendType): boolean;
export declare function getIconType(type: ChartType): LegendIconType;
export declare function getLegendAlign(options: Options): import("../../types/components/axis").ArrowDirection;
