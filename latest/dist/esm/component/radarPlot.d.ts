import Component from "./component";
import { RectModel, CircleModel, PolygonModel } from "../../types/components/series";
import { LabelModel } from "../../types/components/axis";
import { ChartState, RadialAxisData } from "../../types/store/store";
import { RadarPlotType, RadarChartOptions } from "../../types/options";
import { RadarPlotModels, RadarPlotModelType } from "../../types/components/radarPlot";
declare type RenderOptions = {
    type: RadarPlotType;
    categories: string[];
    centerX: number;
    centerY: number;
    degree: number;
    seriesRadius: number;
    radiusRange: number[];
};
export default class RadarPlot extends Component {
    models: RadarPlotModels;
    initialize(): void;
    render(state: ChartState<RadarChartOptions>): void;
    makeRenderOptions(radialAxis: RadialAxisData, type?: RadarPlotType, categories?: string[]): RenderOptions;
    renderPlot(renderOptions: RenderOptions): RadarPlotModelType;
    makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[];
    makeCirclePlot(renderOptions: RenderOptions): CircleModel[];
    renderCategoryDot(renderOptions: RenderOptions): RectModel[];
    renderCategoryLabel(renderOptions: RenderOptions): LabelModel[];
}
export {};
