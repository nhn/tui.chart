// Type definitions for TOAST UI Chart v3.4.2
// TypeScript Version: 3.2.2

type AnyFunc = (...args: any[]) => any;
type DateType = string | number | Date;
type AxisLabelType = DateType;

interface ITextStyleConfig {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
}

interface IDotOptions {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeOpacity?: string;
    strokeWidth?: number;
    radius?: number;
}

interface ISeriesDotOptions extends IDotOptions {
    hover?: IDotOptions;
}

interface IThemeConfig {
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
        title?: ITextStyleConfig;
        label?: ITextStyleConfig;
        tickColor?: string;
    };
    xAxis?: {
        title?: ITextStyleConfig;
        label?: ITextStyleConfig;
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
        dot?: ISeriesDotOptions;
    };
    legend?: {
        label?: ITextStyleConfig;
    };
    tooltip?: any;
    chartExportMenu?: {
        backgroundColor?: string;
        borderRadius?: number;
        borderWidth?: number;
        color?: string
    };
}

interface IRowData {
    categories?: any;
    series: any;
}

interface ITitleConfig {
    text?: string;
    offsetX?: number;
    offsetY?: number;
    align?: string;
}

interface IYAxisConfig {
    title?: string | ITitleConfig;
    labelMargin?: number;
    min?: number;
    max?: number;
    align?: string;
    suffix?: string;
    prefix?: string;
    chartType?: string;
}

interface IXAxisConfig {
    title?: string | ITitleConfig;
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

interface IBaseSeriesConfig {
    showLabel?: boolean;
    allowSelect?: boolean;
}

interface IAreaSeriesConfig extends IBaseSeriesConfig {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    areaOpacity?: number;
    stackType?: string;
}

interface IBarSeriesConfig extends IBaseSeriesConfig {
    stackType?: string;
    barWidth?: number;
    diverging?: boolean;
    colorByPoint?: boolean;
}

interface IComboSeriesConfig extends IBaseSeriesConfig {
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

interface ILineSeriesConfig extends IBaseSeriesConfig {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    shifting?: boolean;
    pointWidth?: number;
}

interface IPieSeriesConfig extends IBaseSeriesConfig {
    radiusRatio?: number;
    startAngle?: number;
    endAngle?: number;
    labelAlign?: string;
    radiusRange?: string[];
    showLegend?: boolean;
}

interface IRadialSeriesConfig {
    showDot?: boolean;
    showArea?: boolean;
}

interface IToolTipConfig {
    suffix?: string;
    template?: AnyFunc;
    align?: string;
    offsetX?: number;
    offsetY?: number;
    grouped?: boolean;
    column?: IToolTipConfig;
}

interface ILegendOptions {
    align?: string;
    showCheckbox?: boolean;
    visible?: boolean;
    maxWidth?: number;
}

interface IPlotBandConfig {
    range: AxisLabelType[] | AxisLabelType[][];
    color: string;
    opacity?: number;
    mergeOverlappingRanges?: boolean;

}

interface IPlotLineConfig {
    value: string | number | Date;
    color: string;
    opacity?: number;
}

interface IPlotOptions {
    showLine?: boolean;
    bands?: IPlotBandConfig[];
    lines?: IPlotLineConfig[];
    type?: string;
}

interface IDimensionConfig {
    width: number;
    height: number;
}

interface IOffsetConfig {
    x: number;
    y: number;
}

interface IPositionConfig {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}

interface IBaseChartOptions {
    width?: number;
    height?: number;
    title?: string | ITitleConfig;
    format?: string | AnyFunc;
}

interface IBaseOptions {
    chart: IBaseChartOptions;
    yAxis?: IYAxisConfig | IYAxisConfig[];
    xAxis?: IXAxisConfig;
    tooltip?: IToolTipConfig;
    legend?: ILegendOptions;
    plot?: IPlotOptions;
    theme?: string;
    libType?: string;
    chartExportMenu?: {
        filename?: string;
        visible?: boolean;
    };
    usageStatistics?: boolean;
}

interface IAreaOptions extends IBaseOptions {
    series?: IAreaSeriesConfig;
}

interface IBarOptions extends IBaseOptions {
    series?: IBarSeriesConfig;
}

interface IBoxPlotOptions extends IBaseOptions {
    series?: IAreaSeriesConfig;
}

interface IBubbleOptons extends IBaseOptions {
    series?: IBaseSeriesConfig;
    circleLegend?: {visible?: boolean};
}

interface IComboOptions extends IBaseOptions {
    series?: IComboSeriesConfig;
}

interface IHeatmapOptions extends IBaseOptions {
    series?: IBaseSeriesConfig;
}

interface ILineOptions extends IBaseOptions {
    series?: ILineSeriesConfig;
}

interface IMapOptions extends IBaseOptions {
    series?: IBaseSeriesConfig;
    map?: string;
}

interface IPieOptions extends IBaseOptions {
    series?: IPieSeriesConfig;
}

interface IRadialOptions extends IBaseOptions {
    series?: IRadialSeriesConfig;
}

interface IBasicOptions extends IBaseOptions {
    series?: IBaseSeriesConfig;
}

interface IChartBase {
    chartType: string;
    className: string;

    addData(category: string, values: any[]): void;
    on(eventName: string, handler: (...args: any[]) => any): any;
    rerender(checkedLegends: any, rawData: any): void; // 데이터가 어떤 형태로 들어갈까요?
    resetTooltipAlign(): void;
    resetTooltipOffset(): void;
    resetTooltipPosition(): void;
    resize(dimension: IDimensionConfig): void;
    setData(rawData: any | null): void;
    setTooltipAlign(align: string): void;
    setTooltipOffset(offset: IOffsetConfig): void;
    setTooltipPosition(position: IPositionConfig): void;
}

interface IAreaChart extends IChartBase {
    addPlotBand(data: IPlotBandConfig): void;
    addPlotLine(data: IPlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IBarChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IBoxplotChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IBubbleChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IBulletChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IColumnChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IComboChart extends IChartBase {
    addPlotBand(data: IPlotBandConfig): void;
    addPlotLine(data: IPlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface ILineChart extends IChartBase {
    addPlotBand(data: IPlotBandConfig): void;
    addPlotLine(data: IPlotLineConfig): void;
    removePlotBand(): void;
    removePlotLine(): void;
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IPieChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IRadialChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IScatterChart extends IChartBase {
    getCheckedLegend(): {area: boolean[]};
    showSeriesLabel(): void;
    hideSeriesLabel(): void;
}

interface IArrayUtil {
    min(arr: any[], condition?: AnyFunc, context?: any): any;
    max(arr: any[], condition?: AnyFunc, context?: any): any;
    any(collection: any[], condition: AnyFunc, context?: any): boolean;
    all(collection: any[], condition: AnyFunc, context?: any): boolean;
    unique(arr: any[], sorted?: boolean, iteratee?: AnyFunc, context?: any): any[];
    pivot(arr2d: any[][]): any[][];
}

interface IFontCss {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

interface IDimensionNPosition {
    dimension: IDimensionConfig;
    position: IPositionConfig;
}

interface IReqAnimationIdObj {
    id: number;
}

interface IRenderUtilFormatValueParam {
    value: number;
    formatFunctions: AnyFunc[];
    valueType: string;
    areaType: string;
    legendName?: string;
    chartType?: string;
}

interface IRenderUtilFormatValuesTypeInfo {
    chartType: string;
    areaType: string;
    valueType: string;
}

interface IRenderUtil {
    concatStr(...args: string[]): string;
    oneLineTrim(...args: string[]): string;
    makeFontCssText(theme: IFontCss): string;
    getRenderedLabelWidth(label: string, theme: IFontCss): number;
    getRenderedLabelHeight(label: string, theme: IFontCss): number;
    getRenderedLabelsMaxWidth(labels: string[], theme: IFontCss): number;
    getRenderedLabelsMaxHeight(labels: string[], theme: IFontCss): number;
    renderDimension(el: Element, dimension: IDimensionConfig): void;
    renderPosition(el: Element, position: IPositionConfig): void;
    renderBackground(el: Element, background: string): void;
    renderFontFamily(el: Element, fontFamily: string): void;
    renderTitle(title: string, theme: IFontCss, className: string): Element;
    expandBound(dimensionNPosition: IDimensionNPosition): IDimensionConfig;
    makeMouseEventDetectorName(prefix: string, value: string, suffix: string): string;
    formatValue(params: IRenderUtilFormatValueParam): string;
    formatValues(values: number[], formatFunctions: AnyFunc[], typeInfos: IRenderUtilFormatValuesTypeInfo): string[];
    formatDate(value: DateType, format?: string): string;
    formatDates(values: DateType[], format?: string): string[];
    cancelAnimation(animation: IReqAnimationIdObj): void;
    startAnimation(animationTime: number, onAnimation: AnyFunc, onCompleted: AnyFunc): IReqAnimationIdObj;
    isOldBrowser(): boolean;
    formatToZeroFill(value: string, len: number): string;
    formatToDecimal(value: string, len: number): string;
    formatToComma(value: string): string;
    makeCssTextFromMap(cssMap: any): string;
    addPrefixSuffix(labels: string[], prefix?: string, suffix?: string): string[];
    addPrefixSuffixItem(label: string, prefix?: string, suffix?: string): string;
    getStyle(target: Element): any;
    generateClipRectId(): string;
    setOpacity(elements: Element | Element[], iteratee: AnyFunc): void;
    makeCssFilterOpacityString(opacity: number): string;
}

declare namespace tuiChart {
    export const arrayUtil: IArrayUtil;
    export const renderUtil: IRenderUtil;

    export function areaChart(container: Element, data: IRowData, options: IAreaOptions): IAreaChart;
    export function barChart(container: Element, data: IRowData, options: IBarOptions): IBarChart;
    export function boxplotChart(container: Element, data: IRowData, options: IBoxPlotOptions): IBoxplotChart;
    export function bubbleChart(container: Element, data: IRowData, options: IBubbleOptons): IBubbleChart;
    export function bulletChart(container: Element, data: IRowData, options: IBarOptions): IBulletChart;
    export function columnChart(container: Element, data: IRowData, options: IBarOptions): IColumnChart;
    export function comboChart(container: Element, data: IRowData, options: IComboOptions): IComboChart;
    export function heatmapChart(container: Element, data: IRowData, options: IHeatmapOptions): IChartBase;
    export function lineChart(container: Element, data: IRowData, options: ILineOptions): ILineChart;
    export function mapChart(container: Element, data: IRowData, options: IMapOptions): IChartBase;
    export function pieChart(container: Element, data: IRowData, options: IPieOptions): IPieChart;
    export function radialChart(container: Element, data: IRowData, options: IRadialOptions): IRadialChart;
    export function scatterChart(container: Element, data: IRowData, options: IBasicOptions): IScatterChart;
    export function treemapChart(container: Element, data: IRowData, options: IBasicOptions): IChartBase;

    export function registerMap(mapName: string, data: any): void;
    export function registerPlugin(libType: string, plugin: any, getPaperCallback?: AnyFunc): void;
    export function registerTheme(themeName: string, theme: IThemeConfig): void;
}

declare module 'tui-chart' {
    export = tuiChart;
}
