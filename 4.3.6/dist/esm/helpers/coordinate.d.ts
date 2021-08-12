import { CoordinateDataType, Point, Rect } from "../../types/options";
import { RawSeries, Series } from "../../types/store/store";
export declare function getCoordinateYValue(datum: number | CoordinateDataType): number;
export declare function getCoordinateXValue(datum: CoordinateDataType): string | number | Date;
export declare function isValueAfterLastCategory(value: number | string | Date, categories: string[]): boolean;
export declare function getCoordinateDataIndex(datum: number | CoordinateDataType, categories: string[], dataIndex: number, startIndex: number): number;
export declare function isCoordinateSeries(series: Series | RawSeries): boolean;
export declare function isModelExistingInRect(rect: Rect, point: Point): boolean;
export declare function isMouseInRect(rect: Rect, mousePosition: Point): boolean;
