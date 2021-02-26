import Chart from "./charts/chart";
import { CircleModel, ClipRectAreaModel, LinePointsModel, PathRectModel } from "../types/components/series";
import { TooltipModel } from "../types/components/tooltip";
import { Options } from "../types/store/store";
declare type BrushModel = ClipRectAreaModel | LinePointsModel | PathRectModel | CircleModel | TooltipModel;
declare type Brush = (ctx: CanvasRenderingContext2D, brushModel: BrushModel) => void;
export default class Painter {
    width: number;
    height: number;
    brushes: Record<string, Brush>;
    chart: Chart<Options>;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor(chart: Chart<Options>);
    showUnsupportedCanvasFeatureError(): void;
    setup(): void;
    setSize(width: number, height: number): void;
    scaleCanvasRatio(ratio: number): void;
    add(name: string, brush: Brush): void;
    addGroups(groups: any[]): void;
    paint(name: string, brushModel: any): void;
    paintForEach(brushModels: any[]): void;
    beforeFrame(): void;
    beforeDraw(transX: number, transY: number): void;
    afterDraw(): void;
}
export {};
