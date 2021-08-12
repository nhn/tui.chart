import { TreemapSeriesData } from "../../types/store/store";
import { Rect } from "../../types/options";
declare type IdType = string | number;
export declare type BoundMap = {
    [key in IdType]: Rect;
};
export declare function squarify(layout: Rect, seriesItems: TreemapSeriesData[]): {};
export {};
