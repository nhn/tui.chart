import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { BackButtonModels } from "../../types/components/resetButton";
import { RectResponderModel } from "../../types/components/series";
export default class BackButton extends Component {
    responders: RectResponderModel[];
    models: BackButtonModels;
    initialize(): void;
    onClick({ responders }: {
        responders: RectResponderModel[];
    }): void;
    render({ options, layout }: ChartState<Options>, computed: any): void;
}
