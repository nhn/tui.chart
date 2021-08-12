import { StyleProp } from "../../types/components/series";
import { FontTheme, BubbleDataLabel, BoxDataLabel } from "../../types/theme";
export declare function makeStyleObj<T, K>(style: StyleProp<T, K>, styleSet: Record<string, object>): T;
export declare function getTranslateString(x: number, y: number): string;
export declare function getTitleFontString(fontTheme: FontTheme): string;
export declare function getFontStyleString(theme: FontTheme): string;
export declare function getFont(theme: BubbleDataLabel | BoxDataLabel): string;
export declare function setLineDash(ctx: CanvasRenderingContext2D, dashSegments: number[]): void;
export declare function getBoxTypeSeriesPadding(tickDistance: number): number;
export declare function fillStyle(ctx: CanvasRenderingContext2D, fillOption: string): void;
export declare function strokeWithOptions(ctx: CanvasRenderingContext2D, style: {
    strokeStyle?: string;
    lineWidth?: number;
}): void;
