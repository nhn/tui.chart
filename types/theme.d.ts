type SeriesThemeMap = {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
  scatter?: BaseSeriesTheme;
  heatmap?: HeatmapChartSeriesTheme;
  treemap?: TreemapChartSeriesTheme;
  bar: BaseSeriesTheme;
  column: BaseSeriesTheme;
  bubble: BaseSeriesTheme;
  pie: BaseSeriesTheme;
  radar: BaseSeriesTheme;
  boxPlot: BaseSeriesTheme;
  bullet: BaseSeriesTheme;
  nestedPie: BaseSeriesTheme;
};

type SeriesTheme =
  | LineChartSeriesTheme
  | AreaChartSeriesTheme
  | ComboChartSeriesTheme
  | BaseSeriesTheme
  | HeatmapChartSeriesTheme
  | TreemapChartSeriesTheme;

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

interface BaseSeriesTheme {
  colors: string[];
}

interface TreemapChartSeriesTheme extends BaseSeriesTheme {
  startColor: string;
  endColor: string;
}

interface HeatmapChartSeriesTheme extends BaseSeriesTheme {
  startColor: string;
  endColor: string;
}

interface LineChartSeriesTheme extends BaseSeriesTheme {
  lineWidth?: number;

  select?: {
    color?: string;
  };

  dot?: {
    color?: string;
    borderWidth?: number;
  };

  hoverDot?: {
    color?: string;
    borderWidth?: number;
  };
}

interface AreaChartSeriesTheme extends BaseSeriesTheme {
  areaOpacity?: number;
}

type NestedPieChartSeriesTheme = BaseSeriesTheme & Record<string, BaseSeriesTheme>;

interface LineScatterChartSeriesTheme extends BaseSeriesTheme {
  line?: BaseSeriesTheme;
  scatter?: BaseSeriesTheme;
}

interface ColumnLineChartSeriesTheme extends BaseSeriesTheme {
  column?: BaseSeriesTheme;
  line?: BaseSeriesTheme;
}

interface LineAreaChartSeriesTheme extends BaseSeriesTheme {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
}

interface BaseThemeOptions {
  series?: BaseSeriesTheme;
  chart?: {};
  plot?: {};
  xAxis?: {};
  yAxis?: {};
  legend?: {};
  tooltip?: {};
  chartExportMenu?: {};
}

interface LineChartThemeOptions extends BaseThemeOptions {
  series?: LineChartSeriesTheme;
}

interface LineAreaChartThemeOptions extends BaseThemeOptions {
  series?: LineAreaChartSeriesTheme;
}
