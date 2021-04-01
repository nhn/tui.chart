import Component from "./component";
import { SectorResponderModel, RadialBarResponderModel, RadialBarSectorModel, RadialBarSeriesModels } from "../../types/components/series";
import { RadialBarChartSeriesTheme, GroupedSector } from "../../types/theme";
import { ChartState, CircularAxisData } from "../../types/store/store";
import { RadialBarChartOptions, CircleTypeEventDetectType } from "../../types/options";
import { SelectSeriesHandlerParams } from "../charts/chart";
import { RespondersThemeType } from "../helpers/responders";
import { TooltipData } from "../../types/components/tooltip";
import { SelectSeriesInfo } from "../../types/charts";
export default class RadialBarSeries extends Component {
    models: RadialBarSeriesModels;
    drawModels: RadialBarSeriesModels;
    responders: RadialBarResponderModel[];
    activatedResponders: RadialBarResponderModel[];
    eventDetectType: CircleTypeEventDetectType;
    tooltipSectorMap: Record<number, SectorResponderModel[]>;
    theme: Required<RadialBarChartSeriesTheme>;
    circularAxis: CircularAxisData;
    initUpdate(delta: number): void;
    syncEndAngle(index: number, category: string): void;
    initialize(): void;
    render(chartState: ChartState<RadialBarChartOptions>): void;
    private initDrawModels;
    private makeResponders;
    private makeTooltipSectorMap;
    private setEventDetectType;
    private getBarWidth;
    private makeRenderOptions;
    private makeSeriesModelData;
    getSeriesColor(name: string, color: string): string;
    makeTooltipData(seriesModels: RadialBarSectorModel[], categories: string[]): TooltipData[];
    makeTooltipResponder(responders: SectorResponderModel[]): {
        x: number;
        y: number;
        data: TooltipData;
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
    private getRadialBarSectorModelsFromResponders;
    private getGroupedSector;
    onMousemoveGroupedType(responders: RadialBarResponderModel[]): void;
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
            groupedSector?: GroupedSector | undefined;
        }) | (import("../../types/brushes").SectorStyle & {
            color?: string | undefined;
            restSeries?: {
                areaOpacity?: number | undefined;
            } | undefined;
            areaOpacity?: number | undefined;
        } & {
            groupedSector?: GroupedSector | undefined;
        }), "shadowColor" | "shadowOffsetX" | "shadowOffsetY" | "shadowBlur" | "strokeStyle">[];
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
    }[];
    onMouseoutComponent: () => void;
    selectSeries: (info: SelectSeriesHandlerParams<RadialBarChartOptions>) => void;
    showTooltip: (info: SelectSeriesInfo) => void;
}
