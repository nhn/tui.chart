import Component from "./component";
import { ChartState, Options } from "../../types/store/store";
import { TooltipInfo, TooltipModel, TooltipDataValue, TooltipModelName, TooltipData } from "../../types/components/tooltip";
import { TooltipTemplateFunc, TooltipFormatter } from "../../types/options";
import { TooltipTheme } from "../../types/theme";
declare type TooltipInfoModels = {
    [key in TooltipModelName]: TooltipInfo[];
};
export default class Tooltip extends Component {
    chartEl: HTMLDivElement;
    tooltipContainerEl: HTMLDivElement;
    templateFunc: TooltipTemplateFunc;
    theme: Required<TooltipTheme>;
    offsetX: number;
    offsetY: number;
    formatter?: TooltipFormatter;
    tooltipInfoModels: TooltipInfoModels;
    onSeriesPointHovered: ({ models, name }: {
        models: TooltipInfo[];
        name: TooltipModelName;
    }) => void;
    isTooltipContainerOverflow(x: number, y: number): {
        overflowX: boolean;
        overflowY: boolean;
    };
    getPositionInRect(model: TooltipModel): {
        x: number;
        y: number;
    };
    setTooltipPosition(model: TooltipModel): void;
    getTooltipInfoModels(): TooltipInfo[];
    renderTooltip(): void;
    initialize({ chartEl }: {
        chartEl: any;
    }): void;
    removeTooltip(): void;
    private setTooltipTransition;
    render({ layout, options, theme }: ChartState<Options>): void;
    getFormattedValue(value: TooltipDataValue, tooltipDataInfo: TooltipData): string;
}
export {};
