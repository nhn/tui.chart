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

type PieChartSeriesTheme = { colors?: string[] };

type NestedPieChartSeriesTheme = Record<string, PieChartSeriesTheme> | PieChartSeriesTheme;

interface TreemapChartSeriesTheme {
  colors?: string[];
  startColor?: string;
  endColor?: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    borderColor?: string;
    borderWidth?: number;
    color?: string;
  };
  hover?: {
    borderColor?: string;
    borderWidth?: number;
    color?: string;
  };
}

interface HeatmapChartSeriesTheme {
  startColor: string;
  endColor: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    borderColor?: string;
    borderWidth?: number;
    color?: string;
  };
  hover?: {
    borderColor?: string;
    borderWidth?: number;
    color?: string;
  };
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

interface ScatterChartSeriesTheme extends CommonSeriesTheme {
  iconTypes?: ScatterSeriesIconType[];
  borderWidth?: number;
  fillColor?: string;
  size?: number;
  select?: {
    size?: number;
    borderColor?: string;
    borderWidth?: number;
    fillColor?: string;
  };
  hover?: {
    size?: number;
    borderColor?: string;
    borderWidth?: number;
    fillColor?: string;
  };
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
