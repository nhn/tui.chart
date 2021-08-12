import { ValueEdge } from "../../types/store/store";
import { Scale } from "../../types/options";
interface LabelOptions {
    dataRange: ValueEdge;
    offsetSize: number;
    rawCategoriesSize: number;
    scaleOption?: Scale;
    showLabel?: boolean;
}
export declare function calculateDatetimeScale(options: LabelOptions): {
    stepSize: number;
    limit: {
        min: number;
        max: number;
    };
    stepCount: number;
    sizeRatio?: number | undefined;
    positionRatio?: number | undefined;
};
export {};
