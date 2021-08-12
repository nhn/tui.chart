import Component from "./component";
import { ChartState, Options, CircularAxisData, VerticalAxisData } from "../../types/store/store";
import { RadialAxisModels, ArcModel } from "../../types/components/radialAxis";
import { RectModel, CircleModel } from "../../types/components/series";
import { CircularAxisTheme, VerticalAxisTheme } from "../../types/theme";
import { BubbleLabelModel, LabelModel, LineModel } from "../../types/components/axis";
export default class RadialAxis extends Component {
    models: RadialAxisModels;
    verticalAxisTheme: Required<VerticalAxisTheme>;
    circularAxisTheme: Required<CircularAxisTheme>;
    initialize(initParam?: {
        name: 'radial' | 'gauge';
    }): void;
    render({ layout, radialAxes, theme, series }: ChartState<Options>): void;
    getBubbleShadowStyle(): {
        shadowColor: string;
        shadowOffsetX: number | undefined;
        shadowOffsetY: number | undefined;
        shadowBlur: number | undefined;
    }[] | null;
    renderVerticalAxisLabel(verticalAxis: VerticalAxisData): BubbleLabelModel[];
    renderDotModel(circularAxis: CircularAxisData): RectModel[];
    renderCircularAxisLabel(circularAxis: CircularAxisData): LabelModel[];
    renderTick(circularAxis: CircularAxisData): LineModel[];
    renderArcLine(circularAxis: CircularAxisData): ArcModel[] | CircleModel[];
}
