import { Options, Series, ChartOptionsUsingYAxis, Axes, ViewAxisLabel, RotationLabelData, InitAxisData } from "../../types/store/store";
import { AxisTitle, DateOption } from "../../types/options";
import { Theme } from "../../types/theme";
import { AxisDataParams } from "../store/axes";
export declare function getAutoAdjustingInterval(count: number, axisWidth: number, categories?: string[]): number;
export declare function isLabelAxisOnYAxis(series: Series, options?: Options): boolean;
export declare function hasBoxTypeSeries(series: Series): boolean;
export declare function isPointOnColumn(series: Series, options: Options): boolean;
export declare function isSeriesUsingRadialAxes(series: Series): boolean;
export declare function getAxisName(labelAxisOnYAxis: boolean, series: Series): {
    valueAxisName: string;
    labelAxisName: string;
};
export declare function getSizeKey(labelAxisOnYAxis: boolean): {
    valueSizeKey: string;
    labelSizeKey: string;
};
export declare function getLimitOnAxis(labels: string[]): {
    min: number;
    max: number;
};
export declare function hasSecondaryYAxis(options: ChartOptionsUsingYAxis): boolean;
export declare function getYAxisOption(options: ChartOptionsUsingYAxis): {
    yAxis: any;
    secondaryYAxis: any;
};
export declare function getValueAxisName(options: ChartOptionsUsingYAxis, seriesName: string, valueAxisName: string): string;
export declare function getValueAxisNames(options: ChartOptionsUsingYAxis, valueAxisName: string): string[];
export declare function getAxisTheme(theme: Theme, name: string): any;
export declare function hasAxesLayoutChanged(previousAxes: Axes, currentAxes: Axes): boolean;
export declare function getRotatableOption(options: Options): boolean;
declare type ViewAxisLabelParam = {
    labels: string[];
    pointOnColumn?: boolean;
    labelDistance?: number;
    labelInterval: number;
    tickDistance: number;
    tickInterval: number;
    tickCount: number;
};
export declare function getViewAxisLabels(axisData: ViewAxisLabelParam, axisSize: number): ViewAxisLabel[];
export declare function makeTitleOption(title?: AxisTitle): {
    text: string;
    offsetX: number;
    offsetY: number;
} | undefined;
export declare function makeFormattedCategory(categories: string[], date?: DateOption): string[];
export declare function makeRotationData(maxLabelWidth: number, maxLabelHeight: number, distance: number, rotatable: boolean): Required<RotationLabelData>;
export declare function getMaxLabelSize(labels: string[], xMargin: number, font?: string): {
    maxLabelWidth: number;
    maxLabelHeight: number;
};
export declare function getLabelXMargin(axisName: string, options: Options): number;
export declare function getInitAxisIntervalData(isLabelAxis: boolean, params: AxisDataParams): InitAxisData;
export {};
