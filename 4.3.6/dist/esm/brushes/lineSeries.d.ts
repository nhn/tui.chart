import { AreaPointsModel, LinePointsModel } from "../../types/components/series";
declare type PointsModel = LinePointsModel | AreaPointsModel;
export declare function linePoints(ctx: CanvasRenderingContext2D, pointsModel: PointsModel): void;
export declare function areaPoints(ctx: CanvasRenderingContext2D, areaPointsModel: AreaPointsModel): void;
export {};
