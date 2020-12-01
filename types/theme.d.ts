import { SectorStyle } from '@src/brushes/sector';
import { ScatterSeriesIconType } from '@t/components/series';

type SeriesThemeMap = {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  scatter?: ScatterChartSeriesTheme;
  heatmap?: HeatmapChartSeriesTheme;
  treemap?: TreemapChartSeriesTheme;
  bar?: CommonSeriesTheme;
  column?: CommonSeriesTheme;
  bubble?: CommonSeriesTheme;
  pie?: PieChartSeriesTheme;
  radar?: RadarChartSeriesTheme;
  boxPlot?: CommonSeriesTheme;
  bullet?: CommonSeriesTheme;
};

type SeriesTheme =
  | LineChartSeriesTheme
  | AreaChartSeriesTheme
  | ComboChartSeriesTheme
  | HeatmapChartSeriesTheme
  | TreemapChartSeriesTheme
  | PieChartSeriesTheme
  | RadarChartSeriesTheme
  | ScatterChartSeriesTheme
  | BubbleChartSeriesTheme
  | NestedPieChartSeriesTheme;

type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};

type ChartTheme = {
  fontFamily?: string;
};

type LegendTheme = {
  label?: FontTheme;
};

type Theme = {
  chart: ChartTheme;
  series: SeriesThemeMap;
  title: FontTheme;
  xAxis: AxisTheme;
  yAxis: AxisTheme | AxisTheme[];
  legend: LegendTheme;
  tooltip: TooltipTheme;
  plot: PlotTheme;
};

type AxisTheme = {
  title?: FontTheme;
  label?: FontTheme;
  width?: number;
  color?: string;
};

type TooltipTheme = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: FontTheme;
  body?: FontTheme;
};

type PlotTheme = {
  lineColor?: string;
  backgroundColor?: string;
};

type ComboChartSeriesTheme =
  | NestedPieChartSeriesTheme
  | LineScatterChartSeriesTheme
  | ColumnLineChartSeriesTheme
  | LineAreaChartSeriesTheme;

type SelectSectorStyle = SectorStyle & {
  color?: string;
  restSeries?: {
    areaOpacity?: number;
  };
  areaOpacity?: number;
};

type PieChartSeriesTheme = {
  colors?: string[];
  lineWidth?: number;
  strokeStyle?: string;
  hover?: SectorStyle & { color?: string };
  select?: SelectSectorStyle;
  areaOpacity?: number;
};

type NestedPieChartSeriesTheme = Record<string, PieChartSeriesTheme> | PieChartSeriesTheme;

interface TreemapChartSeriesTheme {
  colors?: string[];
  startColor?: string;
  endColor?: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
  } & BorderTheme;
  hover?: {
    color?: string;
  } & BorderTheme;
}

interface HeatmapChartSeriesTheme {
  startColor: string;
  endColor: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
  } & BorderTheme;
  hover?: {
    color?: string;
  } & BorderTheme;
}

type DotTheme = {
  color?: string;
  radius?: number;
} & BorderTheme;

interface LineTypeSeriesTheme {
  color?: string;
  lineWidth?: number;
  dashSegments?: number[];
}

interface ScatterChartSeriesTheme extends CommonSeriesTheme {
  iconTypes?: ScatterSeriesIconType[];
  borderWidth?: number;
  fillColor?: string;
  size?: number;
  select?: {
    size?: number;
    fillColor?: string;
  } & BorderTheme;
  hover?: {
    size?: number;
    fillColor?: string;
  } & BorderTheme;
}

interface BubbleChartSeriesTheme extends CommonSeriesTheme {
  borderWidth?: number;
  borderColor?: string;
  select?: Omit<DotTheme, 'radius'>;
  hover?: Omit<DotTheme, 'radius'>;
}

interface LineChartSeriesTheme extends Omit<LineTypeSeriesTheme, 'color'> {
  colors?: string[];
  dot?: Omit<DotTheme, 'color'>;
  select?: {
    dot?: DotTheme;
  };
  hover?: {
    dot?: DotTheme;
  };
}

interface CommonSeriesTheme {
  colors?: string[];
}

interface AreaChartSeriesTheme extends LineChartSeriesTheme {
  areaOpacity?: number;
  select?: {
    dot?: DotTheme;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    };
  };
}

interface LineScatterChartSeriesTheme {
  line?: LineChartSeriesTheme;
  scatter?: ScatterChartSeriesTheme;
  colors?: string[];
}

interface ColumnLineChartSeriesTheme {
  column?: BoxChartSeriesTheme;
  line?: LineChartSeriesTheme;
  colors?: string[];
}

interface LineAreaChartSeriesTheme {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  colors?: string[];
}

interface BaseThemeOptions {
  chart?: ChartTheme;
  title?: FontTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  legend?: LegendTheme;
  tooltip?: TooltipTheme;
  chartExportMenu?: {};
  series?: {};
  plot?: PlotTheme;
}

type GroupedRect = {
  color?: string;
  opacity?: number;
};

type BorderTheme = {
  borderColor?: string;
  borderWidth?: number;
};

type ConnectorTheme = {
  color?: string;
  lineWidth?: number;
  dashSegments?: number[];
};

interface BoxChartSeriesTheme extends CommonSeriesTheme {
  barWidth?: number | string;
  areaOpacity?: number;
  hover?: {
    color?: string;
    groupedRect?: GroupedRect;
  } & ShadowStyle &
    BorderTheme;
  select?: {
    color?: string;
    groupedRect?: GroupedRect;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & ShadowStyle &
    BorderTheme;
  connector?: ConnectorTheme;
}

interface BulletChartSeriesTheme extends CommonSeriesTheme {
  areaOpacity?: number;
  barWidth?: number;
  barWidthRatios?: {
    rangeRatio?: number;
    bulletRatio?: number;
    markerRatio?: number;
  };
  markerLineWidth?: number;
  rangeColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  hover?: {
    color?: string;
  } & BorderTheme &
    ShadowStyle;
  select?: {
    color?: string;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & BorderTheme &
    ShadowStyle;
}

interface BoxPlotChartSeriesTheme extends CommonSeriesTheme {
  areaOpacity?: number;
  barWidth?: number;
  barWidthRatios?: {
    barRatio?: number;
    minMaxBarRatio?: number;
  };
  dot?: BoxPlotDotTheme;
  line?: BoxPlotLineTypeTheme;
  rect?: BorderTheme;
  hover?: {
    color?: string;
    rect?: BorderTheme;
    dot?: BoxPlotDotTheme;
    line?: BoxPlotLineTypeTheme;
  } & ShadowStyle;
  select?: {
    color?: string;
    rect?: BorderTheme;
    dot?: BoxPlotDotTheme;
    line?: BoxPlotLineTypeTheme;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  } & ShadowStyle;
}

type LineTypeTheme = { lineWidth?: number; color?: string };

type BoxPlotLineTypeTheme = {
  whisker?: LineTypeTheme;
  minimum?: LineTypeTheme;
  maximum?: LineTypeTheme;
  median?: LineTypeTheme;
};

type BoxPlotDotTheme = DotTheme & { useSeriesColor?: boolean };

type ShadowStyle = {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
};

interface RadarChartSeriesTheme {
  colors?: string[];
  lineWidth?: number;
  dashSegments?: number[];
  areaOpacity?: number;
  dot?: DotTheme;
  select?: {
    dot?: DotTheme;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity: number;
    };
  };
  hover?: {
    dot?: DotTheme;
  };
}

interface LineChartThemeOptions extends BaseThemeOptions {
  series?: LineChartSeriesTheme;
}

interface AreaChartThemeOptions extends BaseThemeOptions {
  series?: AreaChartSeriesTheme;
}

interface LineAreaChartThemeOptions extends BaseThemeOptions {
  series?: LineAreaChartSeriesTheme;
}

interface LineScatterChartThemeOptions extends BaseThemeOptions {
  series?: LineScatterChartSeriesTheme;
}

interface PieChartThemeOptions extends BaseThemeOptions {
  series?: PieChartSeriesTheme;
}

interface NestedPieChartThemeOptions extends BaseThemeOptions {
  series?: NestedPieChartSeriesTheme;
}

interface RadarChartThemeOptions extends BaseThemeOptions {
  series?: RadarChartSeriesTheme;
}

interface HeatmapChartThemeOptions extends BaseThemeOptions {
  series?: HeatmapChartSeriesTheme;
}

interface TreemapChartThemeOptions extends BaseThemeOptions {
  series?: TreemapChartSeriesTheme;
}

interface ScatterChartThemeOptions extends BaseThemeOptions {
  series?: ScatterChartSeriesTheme;
}

interface BubbleChartThemeOptions extends BaseThemeOptions {
  series?: BubbleChartSeriesTheme;
}

interface BoxChartThemeOptions extends BaseThemeOptions {
  series?: BoxChartSeriesTheme;
}

interface BulletCharThemeOptions extends BaseThemeOptions {
  series?: BulletChartSeriesTheme;
}

interface BoxPlotCharThemeOptions extends BaseThemeOptions {
  series?: BoxPlotChartSeriesTheme;
}
