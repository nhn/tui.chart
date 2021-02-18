import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { TitleOption } from "../../types/options";
import { FontTheme } from "../../types/theme";
import { LabelModel } from "../../types/components/axis";
export default class Title extends Component {
    models: LabelModel[];
    theme: Required<FontTheme>;
    initialize(): void;
    renderTitle(options: string | TitleOption): LabelModel[];
    render({ options, layout, theme }: ChartState<Options>): void;
}
