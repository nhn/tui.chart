import Component from "./component";
import { ChartState, Options, ScaleData } from "../../types/store/store";
import { SpectrumLegendModel, SpectrumLegendModels } from "../../types/components/spectrumLegend";
import { Align } from "../../types/options";
import { TreemapRectResponderModel } from "../../types/components/series";
export default class SpectrumLegend extends Component {
    models: SpectrumLegendModels;
    labels: string[];
    align: Align;
    initialize(): void;
    makeLabels(scale: ScaleData): string[];
    renderSpectrumLegendModel(startColor: string, endColor: string): SpectrumLegendModel[];
    renderSpectrumTooltip: ([responderData]: TreemapRectResponderModel[]) => void;
    render({ layout, legend, colorValueScale, theme }: ChartState<Options>): void;
}
