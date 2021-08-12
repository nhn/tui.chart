import Component from "./component";
import { ChartState, Options, Axes, Scale } from "../../types/store/store";
import Painter from "../painter";
import { LineModel } from "../../types/components/axis";
import { PlotModels } from "../../types/components/plot";
import { RectModel } from "../../types/components/series";
import { PlotLine, PlotBand } from "../../types/options";
import { PlotTheme } from "../../types/theme";
export default class Plot extends Component {
    models: PlotModels;
    startIndex: number;
    theme: Required<PlotTheme>;
    initialize(): void;
    getPlotAxisSize(vertical: boolean): {
        offsetSize: number;
        anchorSize: number;
    };
    renderLines(axes: Axes, categories: string[], lines?: PlotLine[]): LineModel[];
    renderBands(axes: Axes, categories: string[], bands?: PlotBand[]): RectModel[];
    renderPlotLineModels(relativePositions: number[], vertical: boolean, options?: {
        size?: number;
        startPosition?: number;
        axes?: Axes;
    }): LineModel[];
    renderPlotsForCenterYAxis(axes: Axes): LineModel[];
    renderPlots(axes: Axes, scale?: Scale): LineModel[];
    getVerticalTickPixelPositions(axes: Axes, scale?: Scale): number[];
    getHorizontalTickPixelPositions(axes: Axes): number[];
    renderPlotBackgroundRect(): RectModel;
    render(state: ChartState<Options>): void;
    makeLineModel(vertical: boolean, position: number, { color, dashSegments, lineWidth, }: {
        color: string;
        dashSegments?: number[];
        lineWidth?: number;
    }, sizeWidth?: number, xPos?: number): LineModel;
    beforeDraw(painter: Painter): void;
}
