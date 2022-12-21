import { BoxPlotResponderModel, BulletResponderModel, CircleModel, CircleResponderModel, HeatmapRectResponderModel, SectorResponderModel, RectResponderModel, TreemapRectResponderModel, ResponderModel, GroupedSectorResponderModel, GaugeResponderModel } from "../../types/components/series";
import { LineTypeEventDetectType, Point, Rect } from "../../types/options";
import { LabelAxisData } from "../../types/store/store";
import { TooltipData } from "../../types/components/tooltip";
export declare type RespondersThemeType = 'select' | 'hover';
export interface SelectedSeriesEventModel {
    models: ResponderModel[];
    comparisonModel: ResponderModel[];
    name: string;
    eventDetectType?: LineTypeEventDetectType;
    alias?: string;
}
export interface RectResponderInfoForCoordinateType {
    x: number;
    label: string;
}
export declare function isSameSeriesResponder({ models, comparisonModel, name, eventDetectType, }: SelectedSeriesEventModel): boolean | 0 | undefined;
export declare function getNearestResponder(responders: CircleResponderModel[], mousePosition: Point, rect: Rect): CircleResponderModel[];
export declare function makeRectResponderModel(rect: Rect, axis: LabelAxisData, categories: string[], vertical?: boolean): RectResponderModel[];
export declare function makeRectResponderModelForCoordinateType(responderInfo: RectResponderInfoForCoordinateType[], rect: Rect): RectResponderModel[];
export declare function makeTooltipCircleMap(seriesCircleModel: CircleModel[], tooltipDataArr: TooltipData[]): Record<string, CircleResponderModel[]>;
export declare function getDeepestNode(responders: TreemapRectResponderModel[]): TreemapRectResponderModel[];
export declare function isClickSameNameResponder<T extends HeatmapRectResponderModel | BulletResponderModel | GaugeResponderModel>(responders: T[], selectedSeries?: T[]): boolean | 0 | undefined;
export declare function isClickSameCircleResponder(responders: CircleResponderModel[], selectedSeries?: CircleResponderModel[]): boolean;
export declare function isClickSameDataResponder<T extends RectResponderModel | BoxPlotResponderModel | SectorResponderModel>(responders: T[], selectedSeries?: T[]): boolean;
export declare function isClickSameLabelResponder(responders: TreemapRectResponderModel[], selectedSeries?: TreemapRectResponderModel[]): boolean | 0 | undefined;
export declare function isClickSameGroupedRectResponder(responders: RectResponderModel[], selectedSeries?: RectResponderModel[]): boolean | 0 | undefined;
export declare function isClickSameBoxPlotDataResponder(responders: BoxPlotResponderModel[], selectedSeries?: BoxPlotResponderModel[]): boolean;
export declare function makeGroupedSectorResponderModel(radiusRanges: number[], renderOptions: {
    centerX: number;
    centerY: number;
    angleRange: {
        start: number;
        end: number;
    };
    clockwise: boolean;
}, categories: string[]): GroupedSectorResponderModel[];
