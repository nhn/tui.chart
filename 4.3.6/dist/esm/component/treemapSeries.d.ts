import Component from "./component";
import { Rect, TreemapChartOptions } from "../../types/options";
import { ChartState, ScaleData, TreemapSeriesData } from "../../types/store/store";
import { TreemapRectModel, TreemapRectResponderModel, TreemapSeriesModels } from "../../types/components/series";
import { BoundMap } from "../helpers/squarifier";
import { TooltipData } from "../../types/components/tooltip";
import { RespondersThemeType } from "../helpers/responders";
import { RectDataLabel } from "../../types/components/dataLabels";
import { TreemapChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
export default class TreemapSeries extends Component {
    models: TreemapSeriesModels;
    responders: TreemapRectResponderModel[];
    theme: Required<TreemapChartSeriesTheme>;
    activatedResponders: TreemapRectResponderModel[];
    zoomable: boolean;
    initialize(): void;
    private getAllChildSeries;
    render(chartState: ChartState<TreemapChartOptions>): void;
    makeTreemapSeriesResponder(treemapCurrentDepthParentId: string): TreemapRectResponderModel[];
    private makeTooltipData;
    makeBoundMap(series: TreemapSeriesData[], parentId: string, layout: Rect, boundMap?: BoundMap): BoundMap;
    makeDataLabel(useTreemapLeaf: boolean, treemapCurrentDepthParentId: string): RectDataLabel[];
    getColor(treemapSeries: TreemapSeriesData, colors: string[]): string;
    getOpacity(treemapSeries: TreemapSeriesData): number;
    renderTreemapSeries(seriesData: TreemapSeriesData[], options: TreemapChartOptions, colorValueScale: ScaleData, treemapCurrentDepthParentId: string): {
        series: TreemapRectModel[];
        layer: TreemapRectModel[];
    };
    getRespondersWithTheme(responders: TreemapRectResponderModel[], type: RespondersThemeType): ((Pick<TreemapRectModel, "label" | "style" | "type" | "color" | "colorRatio" | "thickness" | "x" | "y" | "width" | "height" | "id" | "parentId" | "hasChild" | "indexes" | "depth" | "ratio" | "opacity" | "colorValue"> & {
        index?: number | undefined;
        data?: Partial<TooltipData> | undefined;
    } & import("../../types/options").Point & import("../../types/options").Size & {
        style: string[];
        color?: string | undefined;
        borderColor?: string | undefined;
        borderWidth?: number | undefined;
    }) | (Pick<TreemapRectModel, "label" | "style" | "type" | "color" | "colorRatio" | "thickness" | "x" | "y" | "width" | "height" | "id" | "parentId" | "hasChild" | "indexes" | "depth" | "ratio" | "opacity" | "colorValue"> & {
        index?: number | undefined;
        data?: Partial<TooltipData> | undefined;
    } & import("../../types/options").Point & import("../../types/options").Size & {
        style: string[];
        color?: string | undefined;
        borderColor?: string | undefined;
        borderWidth?: number | undefined;
    }))[];
    onClick({ responders }: {
        responders: any;
    }): void;
    onMouseoutComponent: () => void;
    onMousemove({ responders }: {
        responders: any;
    }): void;
    emitMouseEvent(responders: TreemapRectResponderModel[]): void;
    selectSeries: ({ seriesIndex }: SelectSeriesHandlerParams<TreemapChartOptions>) => void;
    showTooltip: ({ seriesIndex }: SelectSeriesHandlerParams<TreemapChartOptions>) => void;
}
