import Component from "./component";
import { PieChartOptions, PieSeriesType } from "../../types/options";
import { ChartState } from "../../types/store/store";
import { SectorModel, PieSeriesModels, SectorResponderModel } from "../../types/components/series";
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
    activatedResponders: this['responders'];
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
        theme?: import("../../types/theme").PieChartThemeOptions | undefined;
        chart?: import("../../types/options").BaseChartOptions | undefined;
        xAxis?: import("../../types/options").BaseXAxisOptions | undefined;
        legend?: import("../../types/options").BaseLegendOptions | undefined;
        exportMenu?: import("../../types/options").ExportMenuOptions | undefined;
        tooltip?: import("../../types/options").BaseTooltipOptions | undefined;
        plot?: Partial<import("../../types/options").Size> | undefined;
        responsive?: import("../../types/options").ResponsiveOptions | undefined;
        usageStatistics?: boolean | undefined;
    };
    makeRenderOptions(options: PieChartOptions, maxDataLabelWidth?: number, maxDataLabelHeight?: number): RenderOptions;
    renderPieModel(seriesRawData: PieSeriesType[], renderOptions: RenderOptions, pieIndex?: number): SectorModel[];
    makeTooltipResponder(responders: SectorResponderModel[]): {
        x: number;
        y: number;
        data: import("../../types/components/tooltip").TooltipData;
        seriesIndex: number;
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
        style?: import("../../types/components/series").StyleProp<import("../brushes/sector").SectorStyle, import("../brushes/sector").SectorStyleName> | undefined;
        clockwise: boolean;
        drawingStartAngle: number;
        totalAngle: number;
        alias?: string | undefined;
        percentValue?: number | undefined;
    }[];
    onMousemove({ responders }: {
        responders: any;
    }): void;
    onClick({ responders }: {
        responders: any;
    }): void;
    getResponderModelsWithTheme(responders: SectorResponderModel[], type: RespondersThemeType): {
        color: string;
        style: Pick<(import("../brushes/sector").SectorStyle & {
            color?: string | undefined;
        }) | SelectSectorStyle, "lineWidth" | "shadowColor" | "shadowBlur" | "strokeStyle" | "shadowOffsetX" | "shadowOffsetY">[];
        radius: {
            inner: number;
            outer: number;
        };
        data: import("../../types/components/tooltip").TooltipData;
        seriesIndex: number;
        type: "sector";
        degree: {
            start: number;
            end: number;
        };
        name?: string | undefined;
        value?: number | undefined;
        clockwise: boolean;
        drawingStartAngle: number;
        totalAngle: number;
        alias?: string | undefined;
        percentValue?: number | undefined;
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
