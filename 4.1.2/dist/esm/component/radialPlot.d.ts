import Component from "./component";
import { CircleModel, PolygonModel } from "../../types/components/series";
import { ChartState, RadialAxes } from "../../types/store/store";
import { RadarPlotType, RadarChartOptions } from "../../types/options";
import { RadialPlotModels, RadialPlotModelType } from "../../types/components/radialPlot";
import { LineModel } from "../../types/components/axis";
import { CircularAxisTheme } from "../../types/theme";
import { ArcModel } from "../../types/components/radialAxis";
declare type RenderOptions = {
    type: RadarPlotType;
    categories: string[];
    centerX: number;
    centerY: number;
    degree: number;
    initialRadius: number;
    radius: number;
    radiusRanges: number[];
    lineCount: number;
    tickInterval: number;
    usingArcPlot: boolean;
    drawingStartAngle: number;
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
};
export default class RadarPlot extends Component {
    models: RadialPlotModels;
    circularAxisTheme: Required<CircularAxisTheme>;
    initialize(): void;
    render(state: ChartState<RadarChartOptions>): void;
    makeRenderOptions(radialAxes: RadialAxes, type: RadarPlotType, categories?: string[]): RenderOptions;
    renderPlot(renderOptions: RenderOptions): RadialPlotModelType;
    makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[];
    makeCirclePlot(renderOptions: RenderOptions): CircleModel[];
    makeArc(renderOptions: RenderOptions): ArcModel[];
    renderLine(renderOptions: RenderOptions): LineModel[];
}
export {};
