import Component from "./component";
import { Categories, ChartState, Options, Series } from "../../types/store/store";
import { ExportMenuModels } from "../../types/components/exportMenu";
import { TitleOption } from "../../types/options";
import { RectResponderModel } from "../../types/components/series";
import { ExportMenuTheme } from "../../types/theme";
export declare const BUTTON_RECT_SIZE = 24;
export interface DataToExport {
    series: Series;
    categories?: Categories;
}
export default class ExportMenu extends Component {
    responders: RectResponderModel[];
    models: ExportMenuModels;
    opened: boolean;
    fileName: string;
    data: DataToExport;
    chartEl: HTMLDivElement;
    exportMenuEl: HTMLDivElement;
    theme: Required<ExportMenuTheme>;
    chartBackgroundColor: string;
    chartWidth: number;
    toggleExportMenu: () => void;
    getCanvasExportBtnRemoved: () => HTMLCanvasElement;
    onClickExportButton: (ev: any) => void;
    applyExportButtonPanelStyle(): void;
    makeExportMenuButton(): HTMLDivElement;
    initialize({ chartEl }: {
        chartEl: any;
    }): void;
    onClick({ responders }: {
        responders: RectResponderModel[];
    }): void;
    getFileName(title?: string | TitleOption): string;
    render({ options, layout, chart, series, rawCategories, theme }: ChartState<Options>): void;
    applyPanelWrapperStyle(): void;
    makePanelStyle(type: 'header' | 'body'): string;
}
