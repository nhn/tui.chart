import Component from "./component";
import { ChartState, Options, OptionsWithDataLabels, Series, NestedPieSeriesDataType } from "../../types/store/store";
import { DataLabelModels, DataLabel, DataLabelsMap, SeriesDataLabels, DataLabelSeriesType } from "../../types/components/dataLabels";
declare type SeriesDataLabel = {
    data: SeriesDataLabels;
    name: DataLabelSeriesType;
};
export default class DataLabels extends Component {
    models: DataLabelModels;
    drawModels: DataLabelModels;
    options: OptionsWithDataLabels;
    dataLabelsMap: DataLabelsMap;
    initialize(): void;
    initUpdate(delta: number): void;
    render({ layout, options, series, nestedPieSeries }: ChartState<Options>): void;
    visibleDataLabels(series: Series, nestedPieSeries?: Record<string, NestedPieSeriesDataType>): boolean;
    renderSeriesDataLabels: (seriesDataLabel: SeriesDataLabel) => void;
    appendDataLabels({ name, data }: SeriesDataLabel): void;
    private getDrawModelsAppliedOpacity;
    renderLabelModel(): DataLabelModels;
    makeLabelModel(dataLabels: DataLabel[]): DataLabelModels;
}
export {};
