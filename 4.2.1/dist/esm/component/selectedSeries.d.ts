import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { ResponderModel } from "../../types/components/series";
import { TooltipModelName } from "../../types/components/tooltip";
import { SelectedSeriesEventModel } from "../helpers/responders";
export declare type ResponderSeriesModel = {
    [key in TooltipModelName]: ResponderModel[];
};
declare type ActiveSeriesNames = {
    [key in TooltipModelName]: string[];
};
export default class SelectedSeries extends Component {
    models: ResponderSeriesModel;
    seriesModels: ResponderSeriesModel;
    activeSeriesNames: ActiveSeriesNames;
    isShow: boolean;
    private getSeriesNames;
    getSelectedSeriesModelsForRendering(selectedSeriesEventModel: SelectedSeriesEventModel): ResponderModel[];
    getSelectedSeriesModels(selectedSeriesEventModel: SelectedSeriesEventModel): ResponderModel[];
    renderSelectedSeries: (selectedSeriesEventModel: SelectedSeriesEventModel) => void;
    resetSelectedSeries: () => void;
    private setActiveState;
    initialize(): void;
    render({ layout }: ChartState<Options>): void;
}
export {};
