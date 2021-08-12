import Component from "./component";
import { PieChartOptions, PieSeriesType } from "../../types/options";
import { ChartState } from "../../types/store/store";
import { PieSeriesModels, SectorResponderModel, PieSectorModel } from "../../types/components/series";
import { PieChartSeriesTheme, SelectSectorStyle } from "../../types/theme";
import { RespondersThemeType } from "../helpers/responders";
import { SelectSeriesHandlerParams } from "../charts/chart";
declare type RenderOptions = {
    clockwise: boolean;
    cx: number;
    cy: number;
    drawingStartAngle: number;
    radiusRange: {
        inner: number;
        outer: number;
    };
    angleRange: {
        start: number;
        end: number;
    };
    totalAngle: number;
    defaultRadius?: number;
};
declare type RadiusRangeOption = {
    inner?: number | string;
    outer?: number | string;
};
declare type MaxPieDataLabelSize = {
    width: number;
    height: number;
};
export default class PieSeries extends Component {
    models: PieSeriesModels;
    drawModels: PieSeriesModels;
    responders: SectorResponderModel[];
    activatedResponders: SectorResponderModel[];
    alias: string;
    theme: Required<PieChartSeriesTheme>;
    initUpdate(delta: number): void;
    syncEndAngle(index: number): void;
    initialize(param: {
        alias?: string;
    }): void;
    render(chartState: ChartState<PieChartOptions>): void;
    getRadiusRangeMap(options: PieChartOptions, pieAlias: string[]): Record<string, RadiusRangeOption>;
    getRenderOptionsMap(options: PieChartOptions, pieAlias: string[], maxPieDataLabelSize: MaxPieDataLabelSize): Record<string, RenderOptions>;
    initRenderOptionsMap(options: PieChartOptions, pieAlias: string[], { width, height }: MaxPieDataLabelSize): Record<string, RenderOptions>;
    getOptions(chartOptions: PieChartOptions, alias?: string): {
        series?: import("../../types/options").PieSeriesOptions | undefined;
        legend?: import("../../types/options").NormalLegendOptions | undefined;
        theme?: import("../../types/theme").PieChartThemeOptions | undefined;
        chart?: import("../../types/options").BaseChartOptions | undefined;
        lang?: import("../../types/options").LangOptions | undefined;
        xAxis?: import("../../types/options").BaseXAxisOptions | undefined;
        exportMenu?: import("../../types/options").ExportMenuOptions | undefined;
        tooltip?: import("../../types/options").BaseTooltipOptions | undefined;
        plot?: Partial<import("../../types/options").Size> | undefined;
        responsive?: import("../../types/options").ResponsiveOptions | undefined;
        usageStatistics?: boolean | undefined;
    };
    makeRenderOptions(options: PieChartOptions, maxDataLabelWidth?: number, maxDataLabelHeight?: number): RenderOptions;
    renderPieModel(seriesRawData: PieSeriesType[], renderOptions: RenderOptions, pieIndex?: number): PieSectorModel[];
    makeTooltipResponder(responders: SectorResponderModel[]): {
        x: number;
        y: number;
        data: import("../../types").TooltipDataInfo;
        type: "sector";
        color: string;
        degree: {
            start: number;
            end: number;
        };
        radius: {
            inner: number;
            outer: number;
        };
        name?: string | undefined;
        value?: number | undefined;
        style?: import("../../types/components/series").StyleProp<import("../../types/brushes").SectorStyle, import("../../types/brushes").SectorStyleName> | undefined;
        clockwise: boolean;
        drawingStartAngle?: number | undefined;
        index?: number | undefined;
        seriesColor?: string | undefined;
        seriesIndex?: number | undefined;
        lineWidth?: number | undefined;
        animationDegree?: {
            start: number;
            end: number;
        } | undefined;
    }[];
    onMousemove({ responders }: {
        responders: any;
    }): void;
    onClick({ responders }: {
        responders: any;
    }): void;
    getResponderModelsWithTheme(responders: SectorResponderModel[], type: RespondersThemeType): {
        color: string;
        lineWidth: number;
        style: Pick<(import("../../types/brushes").SectorStyle & {
            color?: string | undefined;
        }) | SelectSectorStyle, "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "strokeStyle">[];
        radius: {
            inner: number;
            outer: number;
        };
        data: import("../../types").TooltipDataInfo;
        type: "sector";
        degree: {
            start: number;
            end: number;
        };
        name?: string | undefined;
        value?: number | undefined;
        clockwise: boolean;
        drawingStartAngle?: number | undefined;
        index?: number | undefined;
        seriesColor?: string | undefined;
        seriesIndex?: number | undefined;
        animationDegree?: {
            start: number;
            end: number;
        } | undefined;
        x: number;
        y: number;
    }[];
    onMouseoutComponent: () => void;
    getOpacity(active: boolean, selectedState: boolean): number;
    getIndexOfGroup(seriesRawData: PieSeriesType[], parentName: string, name: string): number;
    getSeriesColor(rawData: PieSeriesType): string;
    getAliasSeriesColor(rawData: PieSeriesType, seriesRawData: PieSeriesType[], pieIndex: number): string;
    getAliasSeriesOpacity(rootParentName: string, parentName: string, pieIndex: number, indexOfGroup: number, name: string): number;
    hasActiveSeries(): boolean;
    selectSeries: ({ seriesIndex, name }: SelectSeriesHandlerParams<PieChartOptions>) => void;
    showTooltip: ({ seriesIndex, name }: SelectSeriesHandlerParams<PieChartOptions>) => void;
}
export {};
