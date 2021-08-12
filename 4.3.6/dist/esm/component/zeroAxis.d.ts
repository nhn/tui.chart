import Component from "./component";
import { LineModel } from "../../types/components/axis";
import { ChartState, Options } from "../../types/store/store";
export default class ZeroAxis extends Component {
    models: LineModel[];
    initialize(): void;
    render({ layout, axes, series, options }: ChartState<Options>): void;
    renderZeroModel(zeroPosition: number, vertical: boolean): LineModel[];
}
