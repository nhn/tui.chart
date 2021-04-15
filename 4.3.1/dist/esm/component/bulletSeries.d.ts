import Component from "./component";
import { ChartState } from "../../types/store/store";
import { BulletSeriesModels, BulletResponderModel, MarkerResponderModel, BulletLineModel, BulletRectModel, BulletRectResponderModel, ClipRectAreaModel } from "../../types/components/series";
import { BulletChartOptions, BulletSeriesType, BoxTypeEventDetectType } from "../../types/options";
import { TooltipData } from "../../types/components/tooltip";
import { BulletChartSeriesTheme } from "../../types/theme";
import { SelectSeriesHandlerParams } from "../charts/chart";
declare type RenderOptions = {
    ratio: number;
    tickDistance: number;
    zeroPosition: number;
    rangeWidth: number;
    bulletWidth: number;
    markerWidth: number;
};
declare type BulletTooltipData = {
    range: TooltipData[];
    bullet: TooltipData[];
    marker: TooltipData[];
};
declare type BulletTooltipRectMap = Record<string, (BulletRectResponderModel | MarkerResponderModel)[]>;
export default class BulletSeries extends Component {
    models: BulletSeriesModels;
    drawModels: BulletSeriesModels;
    responders: BulletResponderModel[];
    activatedResponders: BulletResponderModel[];
    theme: Required<BulletChartSeriesTheme>;
    eventDetectType: BoxTypeEventDetectType;
    tooltipRectMap: BulletTooltipRectMap;
    vertical: boolean;
    basePosition: number;
    initialize(): void;
    initUpdate(delta: number): void;
    render(state: ChartState<BulletChartOptions>): void;
    protected renderClipRectArea(): ClipRectAreaModel;
    protected makeInitialClipRectModel(clipRect: ClipRectAreaModel): ClipRectAreaModel;
    private getDataLabels;
    private setEventDetectType;
    private getBulletSeriesResponders;
    private makeTooltipRectMap;
    private getBulletSeriesModelsFromRectResponders;
    private getGroupedRect;
    private onMousemoveGroupedType;
    onMousemove({ responders }: {
        responders: any;
    }): void;
    onClick({ responders }: {
        responders: BulletResponderModel[];
    }): void;
    onMouseoutComponent: () => void;
    filterBulletResponder(responders: BulletResponderModel[]): BulletResponderModel[];
    renderRanges(bulletData: BulletSeriesType[], { tickDistance, ratio, zeroPosition, rangeWidth }: RenderOptions): BulletRectModel[];
    renderBullet(bulletData: BulletSeriesType[], { tickDistance, ratio, zeroPosition, bulletWidth }: RenderOptions): BulletRectModel[];
    renderMarkers(bulletData: BulletSeriesType[], { tickDistance, ratio, zeroPosition, markerWidth }: RenderOptions): BulletLineModel[];
    makeTooltipModel(seriesModels: BulletSeriesModels): BulletTooltipData;
    makeTooltipData<T extends BulletRectModel | BulletLineModel>(data: T[], title: 'Range' | 'Actual' | 'Marker'): TooltipData[];
    getBulletBarWidths(tickDistance: number): {
        rangeWidth: number;
        bulletWidth: number;
        markerWidth: number;
    };
    getRangeColor(seriesColor: string, rangeIndex: number, seriesName: string, ignoreRestSeriesOpacity?: boolean): string;
    getSeriesOpacity(seriesName: string, ignoreRestSeriesOpacity?: boolean): number;
    getRespondersWithTheme(responders: BulletResponderModel[], type: 'hover' | 'select'): {
        color: string | undefined;
        thickness: number | undefined;
        borderColor: string | undefined;
        style: {
            shadowColor?: string | undefined;
            shadowOffsetX?: number | undefined;
            shadowOffsetY?: number | undefined;
            shadowBlur?: number | undefined;
        }[];
        modelType: "bullet" | "range";
        seriesColor?: string | undefined;
        tooltipColor?: string | undefined;
        type: "rect";
        value?: number | import("../../types/options").RangeDataType<number> | null | undefined;
        name?: string | undefined;
        index?: number | undefined;
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
    selectSeries: ({ seriesIndex, state }: SelectSeriesHandlerParams<BulletChartOptions>) => void;
    showTooltip: ({ seriesIndex, state }: SelectSeriesHandlerParams<BulletChartOptions>) => void;
}
export {};
