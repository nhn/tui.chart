import { Point, PieSeriesOptions, Rect, DataLabelAnchor, RadialBarSeriesOptions } from "../../types/options";
import { SectorModel, RadiusRange } from "../../types/components/series";
import { RadialDataLabel, RadialAnchor } from "../../types/components/dataLabels";
export declare const DEGREE_180 = 180;
export declare const DEGREE_NEGATIVE_180 = -180;
export declare const DEGREE_360 = 360;
export declare const DEGREE_0 = 0;
export declare const DEGREE_NEGATIVE_90 = -90;
export declare const DEGREE_90 = 90;
declare type RadialPositionParam = {
    anchor: DataLabelAnchor;
    x: number;
    y: number;
    radius: {
        inner: number;
        outer: number;
    };
    degree: {
        start: number;
        end: number;
    };
    drawingStartAngle?: number;
};
export declare function makeAnchorPositionParam(anchor: DataLabelAnchor, model: SectorModel | RadialDataLabel): {
    x: number;
    y: number;
    degree: {
        start: number;
        end: number;
    };
    radius: {
        inner: number;
        outer: number;
    };
    drawingStartAngle?: number | undefined;
    anchor: DataLabelAnchor;
};
export declare function calculateDegreeToRadian(degree: number, drawingStartAngle?: number): number;
export declare function calculateRadianToDegree(radian: number, drawingStartAngle?: number): number;
export declare function getRadialAnchorPosition(param: RadialPositionParam): Point;
export declare function getRadialPosition(x: number, y: number, r: number, radian: number): {
    x: number;
    y: number;
};
export declare function withinRadian(clockwise: boolean, startDegree: number, endDegree: number, currentDegree: number): boolean;
export declare function initSectorOptions(options?: PieSeriesOptions | RadialBarSeriesOptions): {
    clockwise: boolean;
    startAngle: number;
    endAngle: number;
};
export declare function getDefaultRadius({ width, height }: Rect, isSemiCircular?: boolean, maxLabelWidth?: number, maxLabelHeight?: number): number;
export declare function getRadialLabelAlign(model: Pick<RadialDataLabel, 'totalAngle' | 'degree' | 'drawingStartAngle'>, anchor: RadialAnchor, needCalculateByHalf?: boolean): "left" | "right" | "center";
export declare function getRadiusRanges(radiusRanges: number[], padding: number): RadiusRange[];
export declare function calculateValidAngle(angle: number): number;
export {};
