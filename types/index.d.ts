import { LineChartOptions, LineSeriesData } from './options';
import LineChart from '@src/charts/lineChart';

declare namespace tuiChart {
  export function lineChart(
    container: Element,
    data: LineSeriesData,
    options: LineChartOptions
  ): LineChart;
}

declare module 'tui-chart' {
  export default tuiChart;
}
