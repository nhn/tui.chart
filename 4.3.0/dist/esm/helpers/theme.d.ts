import { RawSeries } from "../../types/store/store";
import { Theme, CheckAnchorPieSeries } from "../../types/theme";
export declare const DEFAULT_LINE_SERIES_WIDTH = 2;
export declare const DEFAULT_LINE_SERIES_DOT_RADIUS = 3;
export declare const radarDefault: {
    LINE_WIDTH: number;
    DOT_RADIUS: number;
    HOVER_DOT_RADIUS: number;
    SELECTED_SERIES_OPACITY: number;
    UNSELECTED_SERIES_OPACITY: number;
};
export declare const boxDefault: {
    HOVER_THICKNESS: number;
    BOX_HOVER: {
        shadowColor: string;
        shadowOffsetX: number;
        shadowOffsetY: number;
        shadowBlur: number;
    };
};
export declare const DEFAULT_BULLET_RANGE_OPACITY: number[];
export declare const defaultSeriesTheme: {
    colors: string[];
    startColor: string;
    endColor: string;
    lineWidth: number;
    dashSegments: never[];
    borderWidth: number;
    borderColor: string;
    select: {
        dot: {
            radius: number;
            borderWidth: number;
        };
        areaOpacity: number;
        restSeries: {
            areaOpacity: number;
        };
    };
    hover: {
        dot: {
            radius: number;
            borderWidth: number;
        };
    };
    dot: {
        radius: number;
    };
    areaOpacity: number;
};
export declare function makeAxisTitleTheme(globalFontFamily?: string): {
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    color: string;
};
export declare function makeDefaultTheme(series: RawSeries, globalFontFamily?: string): Theme;
export declare function getDefaultTheme(series: RawSeries, pieSeriesOuterAnchors: CheckAnchorPieSeries | Record<string, CheckAnchorPieSeries>, globalFontFamily?: string, isNestedPieChart?: boolean): Theme;
