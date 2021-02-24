import Component from "./component";
import { ChartState, Options, CircularAxisData, VerticalAxisData } from "../../types/store/store";
import { RadialAxisModels } from "../../types/components/radialAxis";
import { RectModel } from "../../types/components/series";
import { CircularAxisTheme, VerticalAxisTheme } from "../../types/theme";
import { BubbleLabelModel, LabelModel } from "../../types/components/axis";
export default class RadialAxis extends Component {
    models: RadialAxisModels;
    verticalAxisTheme: Required<VerticalAxisTheme>;
    circularAxisTheme: Required<CircularAxisTheme>;
    initialize(): void;
    render({ layout, radialAxes, theme }: ChartState<Options>): void;
    getBubbleShadowStyle(): {
        shadowColor: string;
        shadowOffsetX: number | undefined;
        shadowOffsetY: number | undefined;
        shadowBlur: number | undefined;
    }[] | null;
    renderVerticalAxisLabel(verticalAxis: VerticalAxisData): BubbleLabelModel[];
    renderDotModel(circularAxis: CircularAxisData): RectModel[];
    renderCircularAxisLabel(circularAxis: CircularAxisData): LabelModel[];
}
