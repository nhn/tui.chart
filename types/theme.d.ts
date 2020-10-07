interface SeriesTheme {
  colors?: string[];
}

interface LineChartSeriesTheme extends SeriesTheme {
  dot?: {
    color?: string;
    borderWidth?: number;
    hover?: {
      color?: string;
      borderWidth?: number;
    };
  };
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
