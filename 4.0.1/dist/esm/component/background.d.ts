import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { ChartTheme } from "../../types/theme";
import { BackgroundModel } from "../../types/components/series";
export default class Background extends Component {
    models: BackgroundModel;
    theme: Required<ChartTheme>;
    initialize(): void;
    render({ layout, theme }: ChartState<Options>): void;
}
