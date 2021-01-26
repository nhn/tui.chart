import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { LabelModel } from "../../types/components/axis";
import { AxisType } from "./axis";
import { AxisTitleOption } from "../../types/options";
import { FontTheme } from "../../types/theme";
export default class AxisTitle extends Component {
    models: LabelModel[];
    isYAxis: boolean;
    theme: Required<FontTheme>;
    initialize({ name }: {
        name: AxisType;
    }): void;
    renderAxisTitle(option: Required<AxisTitleOption>, textAlign: CanvasTextAlign): LabelModel[];
    getTextAlign(hasCenterYAxis?: boolean): "left" | "right" | "center";
    render({ axes, layout, theme }: ChartState<Options>): void;
}
