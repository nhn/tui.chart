import { ValueEdge } from "../../types/store/store";
export declare type RGB = [number, number, number];
export declare function makeDistances(startRGB: RGB, endRGB: RGB): RGB;
export declare function getColorRatio(limit: ValueEdge, value?: number | null): number | undefined;
export declare function getSpectrumColor(ratio: number, distances: RGB, startRGB: RGB): string;
