import Component from "./component";
import { CircleModel, PolygonModel, SectorModel } from "../../types/components/series";
import { ChartState, RadialAxes, ScaleData, CircularAxisData, Scale } from "../../types/store/store";
import { RadarPlotType, RadarChartOptions, GaugePlotBand } from "../../types/options";
import { RadialPlotModels, RadialPlotModelType } from "../../types/components/radialPlot";
import { LineModel } from "../../types/components/axis";
import { CircularAxisTheme } from "../../types/theme";
import { ArcModel } from "../../types/components/radialAxis";
declare type RenderOptions = {
    type: RadarPlotType;
    categories: string[];
    centerX: number;
    centerY: number;
    centralAngle: number;
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
declare type GaugeRenderOptions = {
    centerX: number;
    centerY: number;
    clockwise: boolean;
    totalAngle: number;
    scaleMaxLimitValue: number;
    startAngle: number;
    outerRadius: number;
    bandWidth: number;
    bandMargin: number;
    hasCategoryAxis: boolean;
};
export declare function getScaleMaxLimitValue(scale: ScaleData, totalAngle: number): number;
export default class RadarPlot extends Component {
    models: RadialPlotModels;
    circularAxisTheme: Required<CircularAxisTheme>;
    initialize(initParam: {
        name: 'radialPlot' | 'gauge';
    }): void;
    render(state: ChartState<RadarChartOptions>): void;
    makeRenderOptionsOnGauge(hasCategoryAxis: boolean, circularAxis: CircularAxisData, categories: string[], scale: Scale): GaugeRenderOptions;
    makeRenderOptions(radialAxes: RadialAxes, type: RadarPlotType, categories?: string[]): RenderOptions;
    renderPlot(renderOptions: RenderOptions): RadialPlotModelType;
    makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[];
    makeCirclePlot(renderOptions: RenderOptions): CircleModel[];
    makeArc(renderOptions: RenderOptions): ArcModel[];
    renderLine(renderOptions: RenderOptions): LineModel[];
    renderBands(bands: GaugePlotBand[], renderOptions: GaugeRenderOptions, categories: string[]): SectorModel[];
}
export {};
