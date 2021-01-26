import { CircleModel, CircleResponderModel, CircleSeriesModels } from "../../types/components/series";
import { BaseOptions, BubbleChartOptions, BubbleSeriesType, Rect } from "../../types/options";
import { ChartState, Scale } from "../../types/store/store";
import { TooltipData } from "../../types/components/tooltip";
import Component from "./component";
import { BubbleChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
export declare function getMaxRadius(bubbleData: BubbleSeriesType[]): number;
export default class BubbleSeries extends Component {
    models: CircleSeriesModels;
    drawModels: CircleSeriesModels;
    responders: CircleResponderModel[];
    activatedResponders: CircleResponderModel[];
    theme: Required<BubbleChartSeriesTheme>;
    rect: Rect;
    maxRadius: number;
    maxValue: number;
    initialize(): void;
    initUpdate(delta: number): void;
    render(chartState: ChartState<BaseOptions>): void;
    renderBubblePointsModel(seriesRawData: BubbleSeriesType[], scale: Scale): CircleModel[];
    makeTooltipModel(circleData: BubbleSeriesType[]): TooltipData[];
    private getResponderAppliedTheme;
    onMouseoutComponent: () => void;
    onMousemove({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onClick({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    selectSeries: ({ index, seriesIndex, state }: SelectSeriesHandlerParams<BubbleChartOptions>) => void;
    showTooltip: (info: SelectSeriesHandlerParams<BubbleChartOptions>) => void;
}
