import Component from "./component";
import { ChartState, Options, CircularAxisData } from "../../types/store/store";
import { AxisType } from "./axis";
import { AxisTitleOption, Rect } from "../../types/options";
import { FontTheme } from "../../types/theme";
import { LabelModel } from "../../types/components/axis";
export default class AxisTitle extends Component {
    models: LabelModel[];
    isYAxis: boolean;
    isCircularAxis: boolean;
    theme: Required<FontTheme>;
    initialize({ name }: {
        name: AxisType;
    }): void;
    getTitlePosition(offsetX: number, offsetY: number): number[];
    renderAxisTitle(option: Required<AxisTitleOption>, textAlign: CanvasTextAlign): LabelModel[];
    getTextAlign(hasCenterYAxis?: boolean): "left" | "right" | "center";
    getCircularAxisTitleRect(option: Required<AxisTitleOption>, plotRect: Rect, circularAxisData: CircularAxisData): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    render({ axes, radialAxes, layout, theme }: ChartState<Options>): void;
}
