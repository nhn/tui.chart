import Component from "./component";
import Painter from "../painter";
import { ChartState, Options, CenterYAxisData, ViewAxisLabel } from "../../types/store/store";
import { TickModel, LineModel, AxisModels, LabelModel } from "../../types/components/axis";
import { AxisTheme } from "../../types/theme";
import { AxisType } from "./axis";
declare type CoordinateKey = 'x' | 'y';
interface RenderOptions {
    tickInterval: number;
    centerYAxis: CenterYAxisData;
    needRotateLabel?: boolean;
    radian?: number;
    offsetY?: number;
    relativePositions: number[];
}
export default class AxisUsingCenterY extends Component {
    name: AxisType;
    models: AxisModels;
    drawModels: AxisModels;
    yAxisComponent: boolean;
    theme: Required<AxisTheme>;
    initialize({ name }: {
        name: AxisType;
    }): void;
    render({ layout, axes, theme }: ChartState<Options>): void;
    renderAxisLineModel({ xAxisHalfSize, secondStartX }: CenterYAxisData): LineModel[];
    renderTickModels(offsetKey: CoordinateKey, anchorKey: CoordinateKey, renderOptions: RenderOptions): TickModel[];
    renderLabelModels(labels: ViewAxisLabel[], offsetKey: CoordinateKey, anchorKey: CoordinateKey, renderOptions: RenderOptions): LabelModel[];
    axisSize(centerYAxis: CenterYAxisData): any;
    beforeDraw(painter: Painter): void;
}
export {};
