import Component from "./component";
import { BoxPlotSeriesType, BoxPlotChartOptions, BoxTypeEventDetectType } from "../../types/options";
import { ChartState } from "../../types/store/store";
import { BoxPlotSeriesModels, RectModel, CircleModel, BoxPlotModel, RectResponderModel, BoxPlotResponderTypes } from "../../types/components/series";
import { TooltipData } from "../../types/components/tooltip";
import { LineModel } from "../../types/components/axis";
import { BoxPlotChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
declare type RenderOptions = {
    ratio: number;
    tickDistance: number;
    barWidth: number;
    minMaxBarWidth: number;
};
declare type BoxPlotModelData = Array<BoxPlotModel | CircleModel>;
declare type TooltipRectMap = Record<string, BoxPlotResponderTypes[]>;
export default class BoxPlotSeries extends Component {
    models: BoxPlotSeriesModels;
    drawModels: BoxPlotSeriesModels;
    responders: BoxPlotResponderTypes[];
    activatedResponders: BoxPlotResponderTypes[];
    eventDetectType: BoxTypeEventDetectType;
    tooltipRectMap: TooltipRectMap;
    theme: Required<BoxPlotChartSeriesTheme>;
    initialize(): void;
    render(state: ChartState<BoxPlotChartOptions>): void;
    makeTooltipRectMap(boxPlotModelData: BoxPlotModelData, tooltipData: TooltipData[]): Record<string, BoxPlotResponderTypes[]>;
    makeGroupedResponderModel(boxPlotModelData: BoxPlotModelData): RectResponderModel[];
    makeDefaultResponderModel(boxPlotModelData: BoxPlotModelData, tooltipDataArr: TooltipData[]): ({
        data: TooltipData;
        color: string;
        x: number;
        y: number;
        type: "circle";
        radius: number;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").CircleStyle, import("../../types/brushes").CircleStyleName> | undefined;
        seriesIndex?: number | undefined;
        index?: number | undefined;
        angle?: {
            start: number;
            end: number;
        } | undefined;
        name?: string | undefined;
        borderWidth?: number | undefined;
        borderColor?: string | undefined;
    } | {
        data: TooltipData;
        color: string;
        x: number;
        y: number;
        type: "boxPlot";
        name: string;
        rect: RectModel | null;
        median: LineModel | null;
        upperWhisker: LineModel | null;
        lowerWhisker: LineModel | null;
        minimum: LineModel | null;
        maximum: LineModel | null;
        index?: number | undefined;
        boxPlotDetection: {
            x: number;
            width: number;
        };
    })[];
    makeHoveredModel(model: BoxPlotModel | CircleModel): {
        x: number;
        y: number;
        type: "circle";
        radius: number;
        color: string;
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").CircleStyle, import("../../types/brushes").CircleStyleName> | undefined;
        seriesIndex?: number | undefined;
        index?: number | undefined;
        angle?: {
            start: number;
            end: number;
        } | undefined;
        name?: string | undefined;
        borderWidth?: number | undefined;
        borderColor?: string | undefined;
    } | {
        x: number;
        y: number;
        type: "boxPlot";
        color: string;
        name: string;
        rect: RectModel | null;
        median: LineModel | null;
        upperWhisker: LineModel | null;
        lowerWhisker: LineModel | null;
        minimum: LineModel | null;
        maximum: LineModel | null;
        index?: number | undefined;
        boxPlotDetection: {
            x: number;
            width: number;
        };
    };
    getResponderModelFromMap(responders: BoxPlotResponderTypes[]): BoxPlotResponderTypes[];
    onMousemove({ responders }: {
        responders: any;
    }): void;
    onClick({ responders }: {
        responders: any;
    }): void;
    renderSeriesModels(boxPlots: BoxPlotModelData): BoxPlotSeriesModels;
    makeBoxPlots(seriesData: BoxPlotSeriesType[], renderOptions: RenderOptions): BoxPlotModelData;
    makeTooltipModel(seriesData: BoxPlotSeriesType[], categories: string[]): TooltipData[];
    getStartX(seriesIndex: number, dataIndex: number, renderOptions: RenderOptions, seriesLength: number): number;
    getYPos(value: number, ratio: number, lineWidth?: number): number;
    onMouseoutComponent: () => void;
    getBarWidths(tickDistance: number, seriesLength: number): {
        barWidth: number;
        minMaxBarWidth: number;
    };
    getRespondersWithTheme(responders: BoxPlotResponderTypes[], type: 'hover' | 'select'): any[];
    getRect(datum: number[], startX: number, seriesColor: string, { barWidth, ratio }: RenderOptions): RectModel;
    getWhisker(datum: number[], startX: number, seriesColor: string, { barWidth, ratio }: RenderOptions, rect: RectModel): Record<'upperWhisker' | 'lowerWhisker', LineModel>;
    getMedian(datum: number[], startX: number, seriesColor: string, { barWidth, ratio }: RenderOptions): LineModel;
    getMinimum(datum: number[], startX: number, seriesColor: string, { barWidth, ratio, minMaxBarWidth }: RenderOptions): LineModel;
    getMaximum(datum: number[], startX: number, seriesColor: string, { barWidth, ratio, minMaxBarWidth }: RenderOptions): LineModel;
    getSeriesColor(seriesName: string, seriesColor: string): string;
    selectSeries: ({ index, seriesIndex, state, }: SelectSeriesHandlerParams<BoxPlotChartOptions>) => void;
    showTooltip: ({ index, seriesIndex, state }: SelectSeriesHandlerParams<BoxPlotChartOptions>) => void;
}
export {};
