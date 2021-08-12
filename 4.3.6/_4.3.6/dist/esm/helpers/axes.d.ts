import { Options, Series, ChartOptionsUsingYAxis, Axes, ViewAxisLabel, RotationLabelData, InitAxisData, Categories, DefaultRadialAxisData, RadiusInfo, ScaleData } from "../../types/store/store";
import { AxisTitle, Rect } from "../../types/options";
import { Theme } from "../../types/theme";
import { AxisDataParams } from "../store/axes";
export declare function getAutoAdjustingInterval(count: number, axisWidth: number, categories?: string[]): number;
export declare function isLabelAxisOnYAxis({ series, options, categories, }: {
    series: Series;
    options?: Options;
    categories?: Categories;
}): boolean;
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
export declare function getValueAxisNames(options: Options, valueAxisName: string): string[];
export declare function getAxisTheme(theme: Theme, name: string): any;
export declare function hasAxesLayoutChanged(previousAxes: Axes, currentAxes: Axes): boolean;
export declare function getRotatableOption(options: Options): boolean;
declare type ViewAxisLabelParam = {
    labels: string[];
    pointOnColumn?: boolean;
    labelDistance?: number;
    scale?: ScaleData;
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
export declare function getAxisFormatter(options: ChartOptionsUsingYAxis, axisName: string): any;
export declare function getLabelsAppliedFormatter(labels: string[], options: Options, dateType: boolean, axisName: string): any[];
export declare function makeRotationData(maxLabelWidth: number, maxLabelHeight: number, distance: number, rotatable: boolean, axisLayout: Rect): Required<RotationLabelData>;
export declare function getMaxLabelSize(labels: string[], xMargin: number, font?: string): {
    maxLabelWidth: number;
    maxLabelHeight: number;
};
export declare function getLabelXMargin(axisName: string, options: Options): number;
export declare function getInitAxisIntervalData(isLabelAxis: boolean, params: AxisDataParams): InitAxisData;
export declare function getDefaultRadialAxisData(options: Options, plot: Rect, maxLabelWidth?: number, maxLabelHeight?: number, isLabelOnVerticalAxis?: boolean): DefaultRadialAxisData;
export declare function getRadiusInfo(axisSize: number, radiusRange?: {
    inner?: number | string;
    outer?: number | string;
}, count?: number): RadiusInfo;
export declare function isDateType(options: Options, axisName: string): boolean;
export {};
