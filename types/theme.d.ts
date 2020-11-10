import { SectorStyle } from '@src/brushes/sector';

type SeriesThemeMap = {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  scatter?: CommonSeriesTheme;
  heatmap?: HeatmapChartSeriesTheme;
  treemap?: TreemapChartSeriesTheme;
  bar?: CommonSeriesTheme;
  column?: CommonSeriesTheme;
  bubble?: CommonSeriesTheme;
  pie?: PieChartSeriesTheme;
  radar?: CommonSeriesTheme;
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
  | NestedPieChartSeriesTheme;

type ChartTheme = {
  title: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
  };
};

type Theme = {
  series: SeriesThemeMap;
  chart: ChartTheme;
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
}

interface HeatmapChartSeriesTheme {
  startColor: string;
  endColor: string;
}

interface DotTheme {
  color?: string;
  radius?: number;
  borderColor?: string;
  borderWidth?: number;
}

interface LineTypeSeriesTheme {
  color?: string;
  lineWidth?: number;
  dashSegments?: number[];
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
  scatter?: CommonSeriesTheme;
  colors?: string[];
}

interface ColumnLineChartSeriesTheme {
  column?: CommonSeriesTheme;
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
  tooltip?: {};
  chartExportMenu?: {};
  series?: {};
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

interface PieChartThemeOptions extends BaseThemeOptions {
  series?: PieChartSeriesTheme;
}

interface NestedPieChartThemeOptions extends BaseThemeOptions {
  series?: NestedPieChartSeriesTheme;
}
