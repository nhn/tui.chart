import Component from "./component";
import { CircleModel, CircleResponderModel, LineSeriesModels, RectResponderModel, MouseEventType } from "../../types/components/series";
import { LineChartOptions, LineTypeSeriesOptions, LineScatterChartOptions, LineTypeEventDetectType, Point, LineAreaChartOptions } from "../../types/options";
import { ClipRectAreaModel, LinePointsModel } from "../../types/components/series";
import { ChartState, Scale } from "../../types/store/store";
import { LineSeriesType } from "../../types/options";
import { TooltipData } from "../../types/components/tooltip";
import { PointDataLabel } from "../../types/components/dataLabels";
import { LineChartSeriesTheme } from "../../types/theme";
import { SelectSeriesInfo } from "../../types/charts";
interface RenderOptions {
    pointOnColumn: boolean;
    options: LineTypeSeriesOptions;
    tickDistance: number;
    labelDistance?: number;
}
declare type ResponderTypes = CircleResponderModel[] | RectResponderModel[];
export default class LineSeries extends Component {
    models: LineSeriesModels;
    drawModels: LineSeriesModels;
    responders: ResponderTypes;
    theme: Required<LineChartSeriesTheme>;
    activatedResponders: this['responders'];
    eventDetectType: LineTypeEventDetectType;
    tooltipCircleMap: Record<string, CircleResponderModel[]>;
    startIndex: number;
    yAxisName: string;
    initialize(): void;
    initUpdate(delta: number): void;
    private setEventDetectType;
    render(chartState: ChartState<LineChartOptions | LineScatterChartOptions | LineAreaChartOptions>, computed: any): void;
    private getResponders;
    makeNearTypeResponderModel(seriesCircleModel: CircleModel[], tooltipDataArr: TooltipData[], detectionSize?: number): {
        data: TooltipData;
        detectionSize: number | undefined;
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
        x: number;
        y: number;
    }[];
    makeTooltipData(lineSeriesData: LineSeriesType[], categories: string[]): TooltipData[];
    renderClipRectAreaModel(isDrawModel?: boolean): ClipRectAreaModel;
    renderLinePointsModel(seriesRawData: LineSeriesType[], scale: Scale, renderOptions: RenderOptions, categories: string[]): LinePointsModel[];
    renderCircleModel(lineSeriesModel: LinePointsModel[], { options }: RenderOptions): {
        dotSeriesModel: CircleModel[];
        responderModel: CircleModel[];
    };
    getCircleModelsFromRectResponders(responders: RectResponderModel[], mousePositions?: Point): CircleResponderModel[];
    onMousemoveNearType(responders: CircleResponderModel[]): void;
    onMousemoveNearestType(responders: RectResponderModel[], mousePositions: Point): void;
    onMousemoveGroupedType(responders: RectResponderModel[]): void;
    onMousemove({ responders, mousePosition }: MouseEventType): void;
    getDataLabels(seriesModels: LinePointsModel[]): PointDataLabel[];
    private getResponderSeriesWithTheme;
    onClick({ responders, mousePosition }: MouseEventType): void;
    onMouseoutComponent: () => void;
    private getResponderCategoryByIndex;
    selectSeries: (info: SelectSeriesInfo) => void;
    showTooltip: (info: SelectSeriesInfo) => void;
}
export {};
