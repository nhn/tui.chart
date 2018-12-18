/**
 * Type definitions for tui.chart v3.4.1
 * TypeScript Version: 3.2
 */

type AnyFunc = (...args: any[]) => any;
type AxisLabelType = string | number | Date;

interface TextStyleConfig {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
}

interface DotOptions {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: string;
    strokeWidth?: number;
    radius?: number;
}

interface SeriesDotOptions extends DotOptions {
    hover?: DotOptions;
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
        label?: {
            fontSize: number;
            fontFamily: number;
            color: string;
        }
    };
    series?: {
        colors?: string[];
        borderColor?: string;
        selectionColor?: string;
        startColor?: string;
        endColor?: string;
        overColor?: string;
        ranges?: any[];
        borderWidth?: string;
        dot?: SeriesDotOptions;
    };
    legend?: {
        label?: TextStyleConfig;
    };
    tooltip?: any;
    chartExportMenu?: {
        backgroundColor?: string;
        borderRadius?: number;
        borderWidth?: number;
        color?: string
    };
}

interface RowData {
    categories?: any;
    series: any;
}

interface TitleConfig {
    text?: string;
    offsetX?: number;
    offsetY?: number;
    align?: string;
}

interface YAxisConfig {
    title?: string | TitleConfig;
    labelMargin?: number;
    min?: number;
    max?: number;
    align?: string;
    suffix?: string;
    prefix?: string;
    chartType?: string;
}

interface XAxisConfig {
    title?: string | TitleConfig;
    labelMargin?: number;
    labelInterval?: number;
    rotateLabel?: boolean;
    type?: string;
    dateFormat?: string;
    max?: number;
    min?: number;
    suffix?: string;
    prefix?: string;
    tickInterval?: string;
    pointOnColumn?: boolean;
}

interface BaseSeriesConfig {
    showLabel?: boolean;
    allowSelect?: boolean;
}

interface AreaSeriesConfig extends BaseSeriesConfig {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    areaOpacity?: number;
    stackType?: string;
}

interface BarSeriesConfig extends BaseSeriesConfig {
    stackType?: string;
    barWidth?: number;
    diverging?: boolean;
    colorByPoint?: boolean;
}

interface ComboSeriesConfig extends BaseSeriesConfig {
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
    };
    [propName: string]: any; // pie1, pie2

    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
}

interface LineSeriesConfig extends BaseSeriesConfig {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    pointWidth?: number;
}

interface PieSeriesConfig extends BaseSeriesConfig {
    radiusRatio?: number;
    startAngle?: number;
    endAngle?: number;
    labelAlign?: string;
    radiusRange?: string[];
    showLegend?: boolean;
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
    grouped?: boolean;
    column?: ToolTipConfig;
}

interface LegendOptions {
    align?: string;
    showCheckbox?: boolean;
    visible?: boolean;
    maxWidth?: number;
}

interface PlotBandConfig {
    range: AxisLabelType[] | AxisLabelType[][];
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
    bands?: PlotBandConfig[];
    lines?: PlotLineConfig[];
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
    title?: string | TitleConfig;
    format?: string | AnyFunc;
}

interface BaseOptions {
    chart: BaseChartOptions;
    yAxis?: YAxisConfig | YAxisConfig[];
    xAxis?: XAxisConfig;
    tooltip?: ToolTipConfig;
    legend?: LegendOptions;
    plot?: PlotOptions;
    theme?: string;
    libType?: string;
    chartExportMenu?: {
        filename?: string;
        visible?: boolean;
    };
    usageStatistics?: boolean;
}

interface AreaOptions extends BaseOptions {
    series?: AreaSeriesConfig;
}

interface BarOptions extends BaseOptions {
    series?: BarSeriesConfig;
}

interface BoxPlotOptions extends BaseOptions {
    series?: AreaSeriesConfig;
}

interface BubbleOptons extends BaseOptions {
    series?: BaseSeriesConfig;
    circleLegend?: {visible?: boolean};
}

interface ComboOptions extends BaseOptions {
    series?: ComboSeriesConfig;
}

interface HeatmapOptions extends BaseOptions {
    series?: BaseSeriesConfig;
}

interface LineOptions extends BaseOptions {
    series?: LineSeriesConfig;
}

interface MapOptions extends BaseOptions {
    series?: BaseSeriesConfig;
    map?: string;
}

interface PieOptions extends BaseOptions {
    series?: PieSeriesConfig;
}

interface RadialOptions extends BaseOptions {
    series?: RadialSeriesConfig;
}

interface BasicOptions extends BaseOptions {
    series?: BaseSeriesConfig;
}

interface ChartBase {
    chartType: string;
    className: string;

    addData(category: string, values: any[]): void;
    on(eventName: string, handler: (...args: any[]) => any): any;
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
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BarChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BoxplotChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BubbleChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface BulletChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ColumnChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ComboChart extends ChartBase {
    addPlotBand(data: PlotBandConfig): void;
    addPlotLine(data: PlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface LineChart extends ChartBase {
    addPlotBand(data: PlotBandConfig): void;
    addPlotLine(data: PlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface PieChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface RadialChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ScatterChart extends ChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

declare namespace tuiChart {
    export const arrayUtil: any;
    export const renderUtil: any;

    export function areaChart(container: Element, data: RowData, options: AreaOptions): AreaChart;
    export function barChart(container: Element, data: RowData, options: BarOptions): BarChart;
    export function boxplotChart(container: Element, data: RowData, options: BoxPlotOptions): BoxplotChart;
    export function bubbleChart(container: Element, data: RowData, options: BubbleOptons): BubbleChart;
    export function bulletChart(container: Element, data: RowData, options: BarOptions): BulletChart;
    export function columnChart(container: Element, data: RowData, options: BarOptions): ColumnChart;
    export function comboChart(container: Element, data: RowData, options: ComboOptions): ComboChart;
    export function heatmapChart(container: Element, data: RowData, options: HeatmapOptions): ChartBase;
    export function lineChart(container: Element, data: RowData, options: LineOptions): LineChart;
    export function mapChart(container: Element, data: RowData, options: MapOptions): ChartBase;
    export function pieChart(container: Element, data: RowData, options: PieOptions): PieChart;
    export function radialChart(container: Element, data: RowData, options: RadialOptions): RadialChart;
    export function scatterChart(container: Element, data: RowData, options: BasicOptions): ScatterChart;
    export function treemapChart(container: Element, data: RowData, options: BasicOptions): ChartBase;

    export function registerMap(mapName: string, data: any): void;
    export function registerPlugin(libType: string, plugin: any, getPaperCallback?: (...args: any[]) => any): void;
    export function registerTheme(themeName: string, theme: ThemeConfig): void;
}

declare module 'tui-chart' {
    export = tuiChart;
}
