import { LabelModel, RectLabelModel } from "../../types/components/axis";
import { Point } from "../../types/options";
import { RectStyle, StyleProp, Nullable } from "../../types/components/series";
export declare const DEFAULT_LABEL_TEXT = "normal 11px Arial";
export declare type LabelStyleName = 'default' | 'title' | 'axisTitle' | 'rectLabel';
export declare type StrokeLabelStyleName = 'none' | 'stroke';
export interface LabelStyle {
    font?: string;
    fillStyle?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
}
export declare type StrokeLabelStyle = {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
};
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
export declare function rectLabel(ctx: CanvasRenderingContext2D, model: RectLabelModel): void;
export declare type PathRectStyleName = 'shadow';
export declare type BubbleArrowDirection = 'top' | 'right' | 'bottom' | 'left';
export declare type BubbleLabelModel = {
    radius?: number;
    width: number;
    height: number;
    stroke?: string;
    fill?: string;
    lineWidth?: number;
    points?: Point[];
    direction?: BubbleArrowDirection;
    bubbleStyle?: Nullable<StyleProp<RectStyle, PathRectStyleName>>;
    labelStyle?: StyleProp<LabelStyle, LabelStyleName>;
    labelStrokeStyle?: StyleProp<StrokeLabelStyle, StrokeLabelStyleName>;
    text?: string;
} & Point;
export declare function bubbleLabel(ctx: CanvasRenderingContext2D, model: BubbleLabelModel): void;
