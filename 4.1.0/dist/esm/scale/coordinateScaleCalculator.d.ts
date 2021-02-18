import { ValueEdge, ScaleData } from "../../types/store/store";
import { LineChartOptions, Scale } from "../../types/options";
declare type stackScaleType = 'percentStack' | 'minusPercentStack' | 'dualPercentStack' | 'divergingPercentStack';
export declare function getNormalizedStepCount(limitSize: number, stepSize: number): number;
export declare function makeScaleOption(dataRange: ValueEdge, scaleOptions?: Scale): Required<Scale>;
export declare function calculateCoordinateScale(options: {
    dataRange: ValueEdge;
    offsetSize: number;
    useSpectrumLegend?: boolean;
    scaleOption?: Scale;
    minStepSize?: number;
}): ScaleData;
export declare function getStackScaleData(type: stackScaleType): ScaleData;
export declare function calculateScaleForCoordinateLineType(scale: ScaleData, options: LineChartOptions, categories?: string[]): ScaleData;
export {};
