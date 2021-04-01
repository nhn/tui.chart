import { PlotLine, PlotBand, GaugePlotBand } from "../../types/options";
export declare function isExistPlotId<T extends PlotLine | PlotBand | GaugePlotBand>(plots: T[], data: T): boolean;
