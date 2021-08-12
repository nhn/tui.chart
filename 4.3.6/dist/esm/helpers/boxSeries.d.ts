import { Nullable } from "../../types/components/series";
export declare function calibrateDrawingValue(value: number, min: number, max: number): number;
export declare function sumValuesBeforeIndex(values: number[], targetIndex: number, includeTarget?: boolean): number;
export declare function outsideRange(values: number[], currentIndex: number, min: number, max: number): boolean;
export declare function calibrateBoxStackDrawingValue(values: number[], currentIndex: number, min: number, max: number): Nullable<number>;
