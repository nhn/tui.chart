import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { RectLabelModel } from "../../types/components/axis";
export default class RadialAxis extends Component {
    models: RectLabelModel[];
    initialize(): void;
    render({ layout, axes }: ChartState<Options>): void;
}
