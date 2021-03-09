import { LabelModel, BubbleLabelModel } from "../../types/components/axis";
export declare const DEFAULT_LABEL_TEXT = "normal 11px Arial";
export declare const labelStyle: {
    default: {
        font: string;
        fillStyle: string;
        textAlign: string;
        textBaseline: string;
    };
    title: {
        textBaseline: string;
    };
    axisTitle: {
        textBaseline: string;
    };
    rectLabel: {
        font: string;
        fillStyle: string;
        textAlign: string;
        textBaseline: string;
    };
};
export declare const strokeLabelStyle: {
    none: {
        lineWidth: number;
        strokeStyle: string;
    };
    stroke: {
        lineWidth: number;
        strokeStyle: string;
    };
};
export declare function label(ctx: CanvasRenderingContext2D, labelModel: LabelModel): void;
export declare function bubbleLabel(ctx: CanvasRenderingContext2D, model: BubbleLabelModel): void;
