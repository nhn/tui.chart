import Component from "./component";
import { ChartState, Options, Legend as LegendType, LegendDataList } from "../../types/store/store";
import { LegendData, LegendModel } from "../../types/components/legend";
import { RectResponderModel } from "../../types/components/series";
import { LegendTheme } from "../../types/theme";
export default class Legend extends Component {
    models: LegendModel[];
    responders: RectResponderModel[];
    theme: Required<LegendTheme>;
    activatedResponders: RectResponderModel[];
    seriesColorMap: Record<string, string>;
    seriesIconTypeMap: Record<string, string>;
    onClick({ responders }: {
        responders: RectResponderModel[];
    }): void;
    onClickCheckbox: (responders: any) => void;
    onClickLabel: (responders: any) => void;
    initialize(): void;
    initColorAndIconTypeMap(legendData: LegendDataList): void;
    getXPositionWhenVerticalAlign(data: LegendDataList): number[][];
    getXPositionWhenHorizontalAlign(data: LegendDataList): number[][];
    renderLegendModel(legend: LegendType): LegendModel[];
    makeCheckboxResponder(data: LegendData[], showCheckbox: boolean): RectResponderModel[];
    makeLabelResponder(data: LegendData[], showCheckbox: boolean): RectResponderModel[];
    render({ layout, legend, theme }: ChartState<Options>): void;
}
