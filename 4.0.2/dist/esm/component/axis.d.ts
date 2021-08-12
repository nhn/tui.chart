import Component from "./component";
import { ChartState, Options, ViewAxisLabel, AxisData } from "../../types/store/store";
import { LabelModel, TickModel, LineModel, AxisModels } from "../../types/components/axis";
import { AxisTheme } from "../../types/theme";
export declare enum AxisType {
    X = "xAxis",
    Y = "yAxis",
    SECONDARY_Y = "secondaryYAxis"
}
declare type CoordinateKey = 'x' | 'y';
interface RenderOptions {
    relativePositions: number[];
    tickInterval: number;
    needRotateLabel?: boolean;
    radian?: number;
    offsetY?: number;
}
export default class Axis extends Component {
    models: AxisModels;
    drawModels: AxisModels;
    yAxisComponent: boolean;
    theme: Required<AxisTheme>;
    axisSize: number;
    initialize({ name }: {
        name: AxisType;
    }): void;
    render({ layout, axes, theme }: ChartState<Options>): void;
    renderAxisLineModel(): LineModel;
    renderTickModels(offsetKey: CoordinateKey, anchorKey: CoordinateKey, renderOptions: RenderOptions): TickModel[];
    renderLabelModels(labels: ViewAxisLabel[], offsetKey: CoordinateKey, anchorKey: CoordinateKey, renderOptions: RenderOptions): LabelModel[];
    makeRenderOptions(axisData: AxisData): RenderOptions;
    getYAxisAnchorPoint(): number;
    getLabelTextAlign(needRotateLabel?: boolean): "left" | "right" | "center";
    private isRightSide;
    private getYAxisXPoint;
    private hasOnlyAxisLine;
}
export {};