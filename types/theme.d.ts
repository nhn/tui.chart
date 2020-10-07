interface SeriesTheme {
  colors?: string[];
}

interface LineChartSeriesTheme extends SeriesTheme {
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

interface AreaChartSeriesTheme extends SeriesTheme {
  areaOpacity?: number;
}

interface LineAreaChartSeriesTheme extends SeriesTheme {
  line?: LineChartSeriesTheme;
  area?: AreaChartSeriesTheme;
}

interface BaseThemeOptions {
  series?: SeriesTheme;
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
