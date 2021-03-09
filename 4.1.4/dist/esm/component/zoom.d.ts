import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { RectResponderModel } from "../../types/components/series";
import { ZoomModels } from "../../types/components/zoom";
interface RenderOptions {
    pointOnColumn: boolean;
    tickDistance: number;
    tickCount: number;
}
export default class Zoom extends Component {
    models: ZoomModels;
    responders: RectResponderModel[];
    private dragStartPosition;
    private dragStartPoint;
    private isDragging;
    initialize(): void;
    render(state: ChartState<Options>): void;
    resetSelectionArea(): void;
    onMousedown({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onMouseup({ responders }: {
        responders: RectResponderModel[];
    }): void;
    makeRectResponderModel(categories: string[], renderOptions: RenderOptions): RectResponderModel[];
    onMousemove({ responders, mousePosition }: {
        responders: any;
        mousePosition: any;
    }): void;
    onMouseoutComponent(): void;
}
export {};
