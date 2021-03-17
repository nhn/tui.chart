import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { ResetButtonModels } from "../../types/components/resetButton";
import { RectResponderModel } from "../../types/components/series";
export default class ResetButton extends Component {
    responders: RectResponderModel[];
    models: ResetButtonModels;
    initialize(): void;
    onClick({ responders }: {
        responders: RectResponderModel[];
    }): void;
    render({ options, layout }: ChartState<Options>, computed: any): void;
}
