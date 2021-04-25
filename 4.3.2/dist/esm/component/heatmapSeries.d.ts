import Component from "./component";
import { HeatmapChartOptions, Size } from "../../types/options";
import { ChartState, HeatmapSeriesData, ScaleData } from "../../types/store/store";
import { HeatmapRectModel, HeatmapRectModels, HeatmapRectResponderModel } from "../../types/components/series";
import { SeriesDataLabels } from "../../types/components/dataLabels";
import { RespondersThemeType } from "../helpers/responders";
import { HeatmapChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
export default class HeatmapSeries extends Component {
    models: HeatmapRectModels;
    responders: HeatmapRectResponderModel[];
    theme: Required<HeatmapChartSeriesTheme>;
    activatedResponders: HeatmapRectResponderModel[];
    initialize(): void;
    render(chartState: ChartState<HeatmapChartOptions>): void;
    makeDataLabels(): SeriesDataLabels;
    makeHeatmapSeriesResponder(): HeatmapRectResponderModel[];
    renderHeatmapSeries(seriesData: HeatmapSeriesData[], cellSize: Size, colorValueScale: ScaleData): HeatmapRectModel[];
    getRespondersWithTheme(responders: HeatmapRectResponderModel[], type: RespondersThemeType): (({
        type: "rect";
        name: string;
        color: string;
        colorRatio: number;
        colorValue: number | null;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").RectStyle, "shadow"> | undefined;
        thickness: number;
    } & import("../../types/options").Point & Size & {
        data?: ({
            name?: string | undefined;
        } & Partial<import("../../types").TooltipDataInfo>) | undefined;
    } & {
        style: string[];
        color?: string | undefined;
        borderColor?: string | undefined;
        borderWidth?: number | undefined;
    }) | ({
        type: "rect";
        name: string;
        color: string;
        colorRatio: number;
        colorValue: number | null;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").RectStyle, "shadow"> | undefined;
        thickness: number;
    } & import("../../types/options").Point & Size & {
        data?: ({
            name?: string | undefined;
        } & Partial<import("../../types").TooltipDataInfo>) | undefined;
    } & {
        style: string[];
        color?: string | undefined;
        borderColor?: string | undefined;
        borderWidth?: number | undefined;
    }))[];
    onClick({ responders }: {
        responders: HeatmapRectResponderModel[];
    }): void;
    onMouseoutComponent: () => void;
    onMousemove({ responders }: {
        responders: any;
    }): void;
    emitMouseEvent(responders: HeatmapRectResponderModel[]): void;
    selectSeries: ({ index, seriesIndex, state, }: SelectSeriesHandlerParams<HeatmapChartOptions>) => void;
    showTooltip: ({ index, seriesIndex, state }: SelectSeriesHandlerParams<HeatmapChartOptions>) => void;
}
