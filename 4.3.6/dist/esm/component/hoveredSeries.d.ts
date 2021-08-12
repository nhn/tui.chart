import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { TooltipModelName } from "../../types/components/tooltip";
import { CircleResponderModel, ResponderModel, BoxPlotResponderModel } from "../../types/components/series";
import { LineModel } from "../../types/components/axis";
import { ResponderSeriesModel } from "./selectedSeries";
export declare type HoveredSeriesModel = ResponderSeriesModel & {
    guideLine: LineModel[];
};
export default class HoveredSeries extends Component {
    models: HoveredSeriesModel;
    isShow: boolean;
    modelForGuideLine: CircleResponderModel | BoxPlotResponderModel;
    getSeriesModels(type?: TooltipModelName): any[];
    hasGuideLine(): boolean;
    getModelForGuideLine(name: TooltipModelName): any;
    renderHoveredSeries: ({ models, name, eventDetectType, }: {
        models: ResponderModel[];
        name: TooltipModelName;
        eventDetectType?: "nearest" | "grouped" | "point" | "near" | undefined;
    }) => void;
    private renderGroupedModels;
    renderGuideLineModel(model: CircleResponderModel | BoxPlotResponderModel): LineModel;
    resetHoveredSeries: () => void;
    initialize(): void;
    render({ layout }: ChartState<Options>): void;
}
