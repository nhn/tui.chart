import { ClipRectAreaModel, PathRectModel, CircleModel, RectModel } from "../../types/components/series";
import { LineModel } from "../../types/components/axis";
export declare type CircleStyleName = 'default' | 'plot';
export declare type RectStyleName = 'shadow';
export declare function clipRectArea(ctx: CanvasRenderingContext2D, clipRectAreaModel: ClipRectAreaModel): void;
export declare function pathRect(ctx: CanvasRenderingContext2D, pathRectModel: PathRectModel): void;
export declare function circle(ctx: CanvasRenderingContext2D, circleModel: CircleModel): void;
export declare function line(ctx: CanvasRenderingContext2D, lineModel: LineModel): void;
export declare function rect(ctx: CanvasRenderingContext2D, model: RectModel): void;
