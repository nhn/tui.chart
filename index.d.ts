/**
 * Type definitions for tui.chart v3.4.1
 * TypeScript Version: 3.2
 */

type AnyFunc = (...args: Array<any>) => any;
type AxisLabelType = string | number | Date;

interface TextStyleConfig {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
}

interface ThemeConfig {
    chart?: {
        fontFamily?: string;
        background?: string;
    };
    title?: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
        color?: string;
        background?: string;
    };
    yAxis?: {
        title?: TextStyleConfig;
        label?: TextStyleConfig;
        tickColor?: string;
    };
    xAxis?: {
        title?: TextStyleConfig;
        label?: TextStyleConfig;
        tickColor?: string;
    };
    plot?: {
        lineColor?: string;
        background?: string;
    };
    series?: {
        colors?: Array<string>;
        borderColor?: string;
        selectionColor?: string;
        startColor?: string;
        endColor?: string;
        overColor?: string;
        ranges?: Array<any>;
        [propName: string]: any;
    };
    legend?: {
        label?: TextStyleConfig;
    };
}

interface RowData {
    categories?: any;
    series: any;
}

interface titleConfig {
    text?: string;
    offsetX?: number;
    offsetY?: number;
    align?: string;
}

interface yAxisConfig {
    title?: string | titleConfig;
    labelMargin?: number;
    min?: number;
    max?: number;
}

interface xAxisConfig {
    title?: string | titleConfig;
    labelMargin?: number;
    labelInterval?: number;
    rotateLabel?: boolean;
    type?: string;
    dateFormat?: string;
    max?: number;
}

interface baseSeriesConfig {
    showLabel?: boolean;
    allowSelect?: boolean;
}

interface AreaSeriesConfig extends baseSeriesConfig{
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    areaOpacity?: number;
    stackType?: string;
}

interface BarSeriesConfig extends baseSeriesConfig {
    stackType?: string;
    barWidth?: number;
    diverging?: boolean;
    colorByPoint?: boolean;
}

interface ComboSeriesConfig extends baseSeriesConfig {
    column?: {
        stackType?: string;
        showLabel?: boolean;
        barWidth?: number;
    };
    line?: {
        showDot?: boolean;
        showLabel?: boolean;
        spline?: boolean;
    };
    area?: {
        showDot?: boolean;
        showLabel?: boolean;
        spline?: boolean;
    };
    pie?: {
        showLabel?: boolean;
        radiusRatio?: number;
        startAngle?: boolean;
        endAngle?: boolean;
    }
    [propName: string]: any; // pie1, pie2

    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
}

interface LineSeriesConfig extends baseSeriesConfig {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    pointWidth?: number;
}

interface PieSeriesConfig extends baseSeriesConfig {
    radiusRatio?: number;
    startAngle?: number;
    endAngle?: number;
    labelAlign?: string;
    radiusRange?: Array<string>;
}

interface RadialSeriesConfig {
    showDot?: boolean;
    showArea?: boolean;
}

interface ToolTipConfig {
    suffix?: string;
    template?: AnyFunc;
    align?: string;
    offsetX?: number;
    offsetY?: number;
    grouped?: boolean
    column?: ToolTipConfig;
}

interface LegendOptions {
    align?: string;
    showCheckbox?: boolean;
    visible?: boolean;
    maxWidth?: number;
}

interface PlotBandConfig {
    range: Array<AxisLabelType | Array<AxisLabelType>>;
    color: string;
    opacity?: number;
    mergeOverlappingRanges?: boolean;

}

interface PlotLineConfig {
    value: string | number | Date;
    color: string;
    opacity?: number;
}

interface PlotOptions {
    showLine?: boolean;
    bands?: Array<PlotBandConfig>;
    lines?: Array<PlotLineConfig>;
    type?: string;
}

interface DemensionConfig {
    width: number;
    height: number;
}

interface OffsetConfig {
    x: number;
    y: number;
}

interface PositionConfig {
    left: number;
    top: number;
}

interface BaseChartOptions {
    width?: number;
    height?: number;
    title?: string | titleConfig;
    format?: string | AnyFunc;
}

interface BaseOptions {
    chart: BaseChartOptions;
    yAxis?: yAxisConfig | Array<yAxisConfig>;
    xAxis?: xAxisConfig;
    tooltip?: ToolTipConfig;
    legend?: LegendOptions;
    plot?: PlotOptions;
    theme?: string;
    libType?: string;
    chartExportMenu?: {
        filename: string;
    }
    usageStatistics?: boolean;
}

interface AreaOptions extends BaseOptions{
    series?: AreaSeriesConfig;
}

interface BarOptions extends BaseOptions{
    series?: BarSeriesConfig;
}

interface BoxPlotOptions extends BaseOptions {
    series?: AreaSeriesConfig;
}

interface BubbleOptons extends BaseOptions {
    series?: baseSeriesConfig;
    circleLegend?: {visible?: boolean};
}

interface ComboOptions extends BaseOptions {
    series?: ComboSeriesConfig;
}

interface HeatmapOptions extends BaseOptions {
    series?: baseSeriesConfig;
}

interface LineOptions extends BaseOptions {
    series?: LineSeriesConfig;
}

interface MapOptions extends BaseOptions {
    series?: baseSeriesConfig;
}

interface PieOptions extends BaseOptions {
    series?: PieSeriesConfig;
}

interface RadialOptions extends BaseOptions {
    series?: RadialSeriesConfig;
}

interface BasicOptions extends BaseOptions {
    series?: baseSeriesConfig;
}

interface ChartBase {
    chartType: string;
    className: string;

    addData(category: string, values: Array<any>): void;
    on(eventName: string, handler: (...args: Array<any>) => any): any;
    rerender(checkedLegends: any, rawData: any): void; // 데이터가 어떤 형태로 들어갈까요?
    resetTooltipAlign(): void;
    resetTooltipOffset(): void;
    resetTooltipPosition(): void;
    resize(dimension: DemensionConfig): void;
    setData(rawData: any | null): void;
    setTooltipAlign(align: string): void;
    setTooltipOffset(offset: OffsetConfig): void;
    setTooltipPosition(position: PositionConfig): void;

}

interface AreaChart extends ChartBase {
    addPlotBand(data: PlotBandConfig): void;
    addPlotLine(data: PlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BarChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BoxplotChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BubbleChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BulletChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ColumnChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ComboChart extends ChartBase {
    addPlotBand(data: PlotBandConfig): void;
    addPlotLine(data: PlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface HeatmapChart extends ChartBase {}

interface LineChart extends ChartBase {
    addPlotBand(data: PlotBandConfig): void;
    addPlotLine(data: PlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface MapChart extends ChartBase {}

interface PieChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface RadialChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ScatterChart extends ChartBase {
    getCheckedLegend(): {area: Array<boolean>};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface TreemapChart extends ChartBase {}


declare namespace tuiChart {

    export const arrayUtil:any;
    export const renderUtil:any;

    export function areaChart(container: Element, data: RowData, options: AreaOptions): AreaChart;
    export function barChart(container: Element, data: RowData, options: BarOptions): BarChart;
    export function boxplotChart(container: Element, data: RowData, options: BoxPlotOptions): BoxplotChart;
    export function bubbleChart(container: Element, data: RowData, options: BubbleOptons): BubbleChart;
    export function bulletChart(container: Element, data: RowData, options: BarOptions): BulletChart
    export function columnChart(container: Element, data: RowData, options: BarOptions): ColumnChart;
    export function comboChart(container: Element, data: RowData, options: ComboOptions): ComboChart;
    export function heatmapChart(container: Element, data: RowData, options: HeatmapOptions): HeatmapChart;
    export function lineChart(container: Element, data: RowData, options: LineOptions): LineChart;
    export function mapChart(container: Element, data: RowData, options: MapOptions): MapChart;
    export function pieChart(container: Element, data: RowData, options: PieOptions): PieChart;
    export function radialChart(container: Element, data: RowData, options: RadialOptions): RadialChart;
    export function scatterChart(container: Element, data: RowData, options: BasicOptions): ScatterChart;
    export function treemapChart(container: Element, data: RowData, options: BasicOptions): TreemapChart;

    export function registerMap(mapName: string, data: any): void;
    export function registerPlugin(libType: string, plugin: any, getPaperCallback?: (...args: Array<any>) => any): void;
    export function registerTheme(themeName: string, theme: ThemeConfig): void;

}

declare module 'tui-chart' {
    export = tuiChart;
}
