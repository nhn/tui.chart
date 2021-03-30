import { LegendModel } from "../../types/components/legend";
export declare const LEGEND_ITEM_MARGIN_X = 40;
export declare const LEGEND_MARGIN_X = 5;
export declare const LEGEND_CHECKBOX_SIZE = 12;
export declare const LEGEND_ICON_SIZE = 12;
export declare function getLegendItemHeight(fontSize: number): number;
export declare function legend(ctx: CanvasRenderingContext2D, model: LegendModel): void;
