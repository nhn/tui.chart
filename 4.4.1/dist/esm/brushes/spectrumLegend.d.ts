import { SpectrumLegendModel, SpectrumLegendTooltipModel } from "../../types/components/spectrumLegend";
export declare const SPECTRUM_LEGEND_LABEL_HEIGHT = 12;
export declare const spectrumLegendBar: {
    HEIGHT: number;
    PADDING: number;
};
export declare const spectrumLegendTooltip: {
    HEIGHT: number;
    POINT_WIDTH: number;
    POINT_HEIGHT: number;
    PADDING: number;
};
export declare function spectrumLegend(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel): void;
export declare function spectrumTooltip(ctx: CanvasRenderingContext2D, model: SpectrumLegendTooltipModel): void;
