import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { NoDataTextModel } from "../../types/components/series";
export default class NoDataText extends Component {
    models: NoDataTextModel;
    initialize(): void;
    private getCenterPosition;
    render({ layout, series, options, theme }: ChartState<Options>): void;
}
