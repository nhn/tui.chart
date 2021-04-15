import BoxSeries, { SeriesDirection } from "./boxSeries";
import { BoxSeriesType, BoxSeriesDataType, ColumnChartOptions, BarChartOptions, ColumnLineChartOptions } from "../../types/options";
import { ChartState, StackSeriesData, BoxType, Stack, StackDataValues, PercentScaleType, CenterYAxisData } from "../../types/store/store";
import { RectModel, StackTotalModel, RectResponderModel } from "../../types/components/series";
import { LineModel } from "../../types/components/axis";
import { RectDataLabel } from "../../types/components/dataLabels";
import { SelectSeriesHandlerParams } from "../charts/chart";
declare type RenderOptions = {
    stack: Stack;
    scaleType: PercentScaleType;
    tickDistance: number;
    min: number;
    max: number;
    diverging: boolean;
    hasNegativeValue: boolean;
    seriesDirection: SeriesDirection;
    defaultPadding: number;
    offsetSize: number;
    centerYAxis?: CenterYAxisData;
};
export default class BoxStackSeries extends BoxSeries {
    initialize({ name, stackChart }: {
        name: BoxType;
        stackChart: boolean;
    }): void;
    render<T extends BarChartOptions | ColumnChartOptions | ColumnLineChartOptions>(chartState: ChartState<T>, computed: any): void;
    renderStackSeriesModel(seriesData: StackSeriesData<BoxType>, renderOptions: RenderOptions): {
        series: RectModel[];
        connector: LineModel[];
    };
    makeStackSeriesModel(stackData: StackDataValues, renderOptions: RenderOptions, seriesRawData: BoxSeriesType<BoxSeriesDataType>[], stackGroupCount?: number, stackGroupIndex?: number): {
        series: RectModel[];
        connector: LineModel[];
    };
    makeStackGroupSeriesModel(stackSeries: StackSeriesData<BoxType>, renderOptions: RenderOptions): {
        series: RectModel[];
        connector: LineModel[];
    };
    makeConnectorSeriesModel(stackData: StackDataValues, renderOptions: RenderOptions, stackGroupCount?: number, stackGroupIndex?: number): LineModel[];
    private getTooltipData;
    private makeGroupStackTooltipData;
    private makeStackTooltipData;
    private makeConnectorModel;
    private getStackValueRatio;
    private getStackBarLength;
    private getStackColumnWidth;
    private getSeriesPosition;
    private getStackStartPosition;
    private calcStartPosOnLeftBottomSide;
    private calcStartPosOnRightTopSide;
    private calcStartPositionWithStack;
    private calcStartPositionWithPercent;
    private getStackRectInfo;
    getDataLabels(seriesModels: RectModel[], renderOptions: RenderOptions): RectDataLabel[];
    getTotalDataLabels(seriesData: StackSeriesData<BoxType>, renderOptions: RenderOptions): RectDataLabel[];
    makeGroupTotalDataLabels(stackSeries: StackSeriesData<BoxType>, renderOptions: RenderOptions): RectDataLabel[];
    makeTotalDataLabels(stackData: StackDataValues, renderOptions: RenderOptions, stackGroupCount?: number, stackGroupIndex?: number): RectDataLabel[];
    makeTotalDataLabel(totalLabel: StackTotalModel, centerYAxis?: CenterYAxisData): RectDataLabel;
    onMousemoveGroupedType(responders: RectResponderModel[]): void;
    selectSeries: ({ index, seriesIndex, state, }: SelectSeriesHandlerParams<BarChartOptions | ColumnChartOptions>) => void;
}
export {};
