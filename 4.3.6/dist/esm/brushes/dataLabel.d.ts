import { DataLabelModel } from "../../types/components/dataLabels";
import { Point } from "../../types/options";
import { ArrowTheme, ArrowDirection } from "../../types/theme";
export declare function dataLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel): void;
export declare function drawBubbleLabel(ctx: CanvasRenderingContext2D, model: DataLabelModel): void;
export declare function getBubbleArrowPoints(direction: ArrowDirection, { x, y }: Point, arrowPointTheme: ArrowTheme): Point[];
