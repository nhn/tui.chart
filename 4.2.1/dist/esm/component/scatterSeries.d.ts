import Component from "./component";
import { Rect, ScatterChartOptions, ScatterSeriesType } from "../../types/options";
import { ChartState, ValueEdge } from "../../types/store/store";
import { TooltipData } from "../../types/components/tooltip";
import { CircleResponderModel, ScatterSeriesModel, ScatterSeriesModels } from "../../types/components/series";
import { ScatterChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
export default class ScatterSeries extends Component {
    theme: Required<ScatterChartSeriesTheme>;
    models: ScatterSeriesModels;
    drawModels: ScatterSeriesModels;
    responders: CircleResponderModel[];
    activatedResponders: CircleResponderModel[];
    rect: Rect;
    initialize(): void;
    initUpdate(delta: number): void;
    render(chartState: ChartState<ScatterChartOptions>): void;
    renderScatterPointsModel(seriesRawData: ScatterSeriesType[], xAxisLimit: ValueEdge, yAxisLimit: ValueEdge): ScatterSeriesModel[];
    makeTooltipModel(circleData: ScatterSeriesType[]): TooltipData[];
    private getClosestModel;
    private getResponderAppliedTheme;
    onMousemove({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onClick({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onMouseoutComponent: () => void;
    getModelsForSelectInfo: (info: SelectSeriesHandlerParams<ScatterChartOptions>) => CircleResponderModel[] | undefined;
    selectSeries: (info: SelectSeriesHandlerParams<ScatterChartOptions>) => void;
    showTooltip: (info: SelectSeriesHandlerParams<ScatterChartOptions>) => void;
}
