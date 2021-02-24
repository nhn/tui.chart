import { RangeDataType, BoxSeriesDataType } from "../../types/options";
import { TooltipDataValue } from "../../types/components/tooltip";
export declare function isRangeValue<T>(value: unknown): value is RangeDataType<T>;
export declare function isRangeData(data?: BoxSeriesDataType[] | TooltipDataValue): boolean;
export declare function isZooming(categories: string[], zoomRange?: RangeDataType<number>): boolean;
export declare function getDataInRange<T>(data: T[], range?: RangeDataType<number>): T[];
