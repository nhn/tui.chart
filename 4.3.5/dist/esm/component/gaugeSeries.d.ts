import Component from "./component";
import { SectorResponderModel, GaugeSeriesModels, ClockHandModel, GaugeResponderModel, ClockHandResponderModel } from "../../types/components/series";
import { GaugeChartSeriesTheme } from "../../types/theme";
import { ChartState, CircularAxisData } from "../../types/store/store";
import { GaugeChartOptions } from "../../types/options";
import { SelectSeriesHandlerParams } from "../charts/chart";
import { RespondersThemeType } from "../helpers/responders";
import { TooltipData } from "../../types/components/tooltip";
import { SelectSeriesInfo } from "../../types/charts";
declare type TooltipMap = {
    solid: SectorResponderModel[];
    clockHand: ClockHandResponderModel[];
};
export default class GaugeSeries extends Component {
    models: GaugeSeriesModels;
    drawModels: GaugeSeriesModels;
    responders: GaugeResponderModel[];
    activatedResponders: GaugeResponderModel[];
    tooltipMap: TooltipMap;
    theme: Required<GaugeChartSeriesTheme>;
    circularAxis: CircularAxisData;
    initialize(): void;
    initUpdate(delta: number): void;
    updateModels(current: any, target: any, delta: number): void;
    update(delta: number): void;
    syncEndAngle(index: number): void;
    syncSectorEndAngle(index: number): void;
    render(chartState: ChartState<GaugeChartOptions>): void;
    private renderSolidModels;
    private initDrawModels;
    private getResponders;
    private getHandSize;
    private renderClockHands;
    private renderBackgroundSolid;
    private renderSectors;
    private makeTooltipMap;
    private makeRenderOptions;
    getSeriesColor(name: string, color: string): string;
    makeTooltipData(seriesModels: ClockHandModel[]): TooltipData[];
    onMousemove({ responders }: {
        responders: any;
    }): void;
    getResponderModels(responders: GaugeResponderModel[]): GaugeResponderModel[];
    onClick({ responders }: {
        responders: any;
    }): void;
    getResponderModelsWithSolidTheme(responder: SectorResponderModel, type: RespondersThemeType): {
        color: string;
        lineWidth: number;
        style: Pick<Pick<import("../../types/theme").SolidTheme, "color" | "lineWidth" | "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "barWidth" | "strokeStyle">, "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "strokeStyle">[];
        radius: {
            inner: number;
            outer: number;
        };
        data: TooltipData;
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
    };
    getResponderWithClockHandTheme(responder: ClockHandResponderModel, type: RespondersThemeType): {
        color: string;
        pin: {
            radius: number;
            color: string;
            style: {
                strokeStyle: string;
                lineWidth: number;
            }[];
        };
        baseLine: number;
        handSize: number;
        detectionSize: number;
        data: TooltipData;
        type: "clockHand";
        name: string;
        value: string | number;
        x: number;
        y: number;
        x2: number;
        y2: number;
        degree: number;
        animationDegree: number;
        seriesData: (string | number)[];
        index: number;
        seriesIndex: number;
    };
    getResponderModelsWithTheme(responders: (SectorResponderModel | ClockHandResponderModel)[], type: RespondersThemeType): ({
        color: string;
        lineWidth: number;
        style: Pick<Pick<import("../../types/theme").SolidTheme, "color" | "lineWidth" | "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "barWidth" | "strokeStyle">, "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "strokeStyle">[];
        radius: {
            inner: number;
            outer: number;
        };
        data: TooltipData;
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
    } | {
        color: string;
        pin: {
            radius: number;
            color: string;
            style: {
                strokeStyle: string;
                lineWidth: number;
            }[];
        };
        baseLine: number;
        handSize: number;
        detectionSize: number;
        data: TooltipData;
        type: "clockHand";
        name: string;
        value: string | number;
        x: number;
        y: number;
        x2: number;
        y2: number;
        degree: number;
        animationDegree: number;
        seriesData: (string | number)[];
        index: number;
        seriesIndex: number;
    })[];
    onMouseoutComponent: () => void;
    selectSeries: (info: SelectSeriesHandlerParams<GaugeChartOptions>) => void;
    showTooltip: (info: SelectSeriesInfo) => void;
}
export {};
