import Component from "./component";
import { RadarSeriesModels, CircleModel, CircleResponderModel, LinePointsModel, AreaPointsModel } from "../../types/components/series";
import { ChartState } from "../../types/store/store";
import { RadarSeriesType, Point, RadarChartOptions } from "../../types/options";
import { TooltipData } from "../../types/components/tooltip";
import { RadarChartSeriesTheme } from "../../types/theme";
import { RespondersThemeType } from "../helpers/responders";
import { SelectSeriesHandlerParams } from "../charts/chart";
declare type RenderOptions = {
    categories: string[];
    centerX: number;
    centerY: number;
    degree: number;
    showArea: boolean;
    ratio: number;
};
declare type RadarPointsData = {
    distances: number[];
    linePoints: (Point | null)[];
    areaPoints: Point[];
    seriesColor: string;
    fillColor: string;
    lineColor: string;
    name: string;
    data: number[];
};
interface RadarCircleModel extends CircleModel {
    name: string;
    value: number;
    index: number;
}
export default class RadarSeries extends Component {
    models: RadarSeriesModels;
    drawModels: RadarSeriesModels;
    responders: CircleResponderModel[];
    activatedResponders: CircleResponderModel[];
    theme: Required<RadarChartSeriesTheme>;
    initialize(): void;
    render(state: ChartState<RadarChartOptions>): void;
    initDrawModels<T extends AreaPointsModel | LinePointsModel>(modelName: 'area' | 'line', centerX: number, centerY: number): (T & {
        distances: number[] | undefined;
        points: {
            x: number;
            y: number;
        }[];
    })[];
    onMouseoutComponent: () => void;
    makeTooltipModel(circleModel: RadarCircleModel[], categories: string[]): TooltipData[];
    getRespondersWithTheme(responders: CircleResponderModel[], type: RespondersThemeType): {
        radius: number | undefined;
        color: string;
        borderColor: string;
        borderWidth: number | undefined;
        detectionSize?: number | undefined;
        data: TooltipData;
        type: "circle";
        style?: import("../../types/components/series").StyleProp<import("../../types/components/series").CircleStyle, import("../../types/brushes").CircleStyleName> | undefined;
        seriesIndex?: number | undefined;
        index?: number | undefined;
        angle?: {
            start: number;
            end: number;
        } | undefined;
        name?: string | undefined;
        x: number;
        y: number;
    }[];
    onClick({ responders }: {
        responders: any;
    }): void;
    onMousemove({ responders }: {
        responders: CircleResponderModel[];
    }): void;
    makeRadarPointsData(seriesData: RadarSeriesType[], renderOptions: RenderOptions): RadarPointsData[];
    renderAreaModels(radarPointsData: RadarPointsData[]): AreaPointsModel[];
    renderLineModels(radarPointsData: RadarPointsData[]): LinePointsModel[];
    renderDotModels(radarPointsData: RadarPointsData[]): RadarCircleModel[];
    getSeriesColor(showArea: boolean, seriesColor: string, name: string): {
        lineColor: string;
        fillColor: string;
    };
    selectSeries: ({ index, seriesIndex, state }: SelectSeriesHandlerParams<RadarChartOptions>) => void;
    showTooltip: ({ index, seriesIndex, state }: SelectSeriesHandlerParams<RadarChartOptions>) => void;
}
export {};
