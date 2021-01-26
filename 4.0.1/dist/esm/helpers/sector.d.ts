import { Point } from "../../types/options";
import { SectorModel } from "../../types/components/series";
import { RadialAnchor } from "../../types/components/dataLabels";
declare type RadialPositionParam = {
    anchor: RadialAnchor;
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
    drawingStartAngle: number;
};
export declare function makeAnchorPositionParam(anchor: RadialAnchor, model: SectorModel): {
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
    drawingStartAngle: number;
    anchor: RadialAnchor;
};
export declare function calculateDegreeToRadian(degree: number, drawingStartAngle?: number): number;
export declare function calculateRadianToDegree(radian: number, drawingStartAngle?: number): number;
export declare function getRadialAnchorPosition(param: RadialPositionParam): Point;
export declare function getRadialPosition(x: number, y: number, r: number, radian: number): {
    x: number;
    y: number;
};
export declare function withinRadian(clockwise: boolean, startDegree: number, endDegree: number, currentDegree: number): boolean;
export {};
