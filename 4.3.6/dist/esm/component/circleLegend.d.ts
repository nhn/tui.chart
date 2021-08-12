import Component from "./component";
import { ChartState, Options, CircleLegend as CircleLegendType } from "../../types/store/store";
import { CircleLegendModels } from "../../types/components/circleLegend";
import { BubbleSeriesType } from "../../types/options";
export default class CircleLegend extends Component {
    models: CircleLegendModels;
    initialize(): void;
    render({ layout, series, circleLegend }: ChartState<Options>): void;
    renderCircleLegend(bubbleData: BubbleSeriesType[], circleLegend: CircleLegendType): void;
}
