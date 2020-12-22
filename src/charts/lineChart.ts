import Chart, { SelectSeriesInfo } from './chart';

import dataRange from '@src/store/dataRange';
import scale from '@src/store/scale';
import axes from '@src/store/axes';
import plot from '@src/store/plot';

import Tooltip from '@src/component/tooltip';
import Plot from '@src/component/plot';
import LineSeries from '@src/component/lineSeries';
import Axis from '@src/component/axis';
import Legend from '@src/component/legend';
import DataLabels from '@src/component/dataLabels';
import AxisTitle from '@src/component/axisTitle';
import Title from '@src/component/title';
import ExportMenu from '@src/component/exportMenu';
import HoveredSeries from '@src/component/hoveredSeries';
import Zoom from '@src/component/zoom';
import ResetButton from '@src/component/resetButton';
import SelectedSeries from '@src/component/selectedSeries';

import * as lineSeriesBrush from '@src/brushes/lineSeries';
import * as basicBrush from '@src/brushes/basic';
import * as axisBrush from '@src/brushes/axis';
import * as legendBrush from '@src/brushes/legend';
import * as labelBrush from '@src/brushes/label';
import * as exportMenuBrush from '@src/brushes/exportMenu';
import * as dataLabelBrush from '@src/brushes/dataLabel';
import * as resetButtonBrush from '@src/brushes/resetButton';

import {
  LineChartOptions,
  LineSeriesData,
  LineSeriesDataType,
  LineSeriesType,
  LineSeriesInput,
  PlotLine,
  PlotBand,
} from '@t/options';

export interface LineChartProps {
  el: HTMLElement;
  options: LineChartOptions;
  data: LineSeriesData;
}

/**
 * @class
 * @classdesc Line Chart
 * @param {Object} props
 *    @param {HTMLElement} props.el - The target element to create chart.
 *    @param {Object} props.data - Data for making Line Chart.
 *      @param {Array<string>} [props.data.categories] - Categories.
 *      @param {Array<Object>} props.data.series - Series data.
 *        @param {string} props.data.series.name - Series name.
 *        @param {Array<number|Object|Array>} props.data.series.data - Series data.
 *    @param {Object} [props.options] - Options for making Line Chart.
 *      @param {Object} [props.options.chart]
 *        @param {string|Object} [props.options.chart.title] - Chart title text or options.
 *          @param {string} [props.options.chart.title.text] - Chart title text.
 *          @param {number} [props.options.chart.title.offsetX] - offset value to move title horizontally.
 *          @param {number} [props.options.chart.title.offsetY] - Offset value to move title vertically.
 *          @param {string} [props.options.chart.title.align] - Chart text align. 'left', 'right', 'center' is available.
 *        @param {boolean | Object} [props.options.chart.animation] - Whether to use animation and duration when rendering the initial chart.
 *        @param {number|string} [props.options.chart.width] - Chart width. 'auto' or if not write, the width of the parent container is followed.'auto' or if not created, the width of the parent container is followed.
 *        @param {number|string} [props.options.chart.height] - Chart height. 'auto' or if not write, the width of the parent container is followed.'auto' or if not created, the height of the parent container is followed.
 *      @param {Object} [props.options.series]
 *        @param {boolean} [props.options.series.selectable=false] - Whether to select series or not.
 *        @param {boolean} [props.options.series.showDot=false] - Whether to show dot or not.
 *        @param {boolean} [props.options.series.spline=false] - Whether to make spline chart or not.
 *        @param {boolean} [props.options.series.zoomable=false] - Whether to use zoom feature or not.
 *        @param {string} [props.options.series.eventDetectType] - Event detect type. 'near', 'nearest', 'grouped', 'point' is available.
 *        @param {boolean} [props.options.series.shift=false] - Whether to use shift when addData or not.
 *        @param {Object} [props.options.series.dataLabels] - Set the visibility, location, and formatting of dataLabel. For specific information, refer to the {@link https://github.com/nhn/tui.chart|DataLabels guide} on github.
 *      @param {Object} [props.options.xAxis]
 *        @param {Object} [props.options.xAxis.title] - Axis title.
 *        @param {boolean} [props.options.xAxis.pointOnColumn=false] - Whether to move the start of the chart to the center of the column.
 *        @param {boolean} [props.options.xAxis.rotateLabel=true] - Whether to allow axis label rotation.
 *        @param {boolean|Object} [props.options.xAxis.date] - Whether the x axis label is of date type. Format option used for date typeWhether the x axis label is of date type. If use date type, format option used for date type.
 *        @param {Object} [props.options.xAxis.tick] - You can change the tick interval through the tick.interval option.
 *        @param {Object} [props.options.xAxis.label] - You can change the label interval through the label.interval option.
 *        @param {Object} [props.options.xAxis.scale] - You can change axis minimum, maximum, step size value with scale option.
 *        @param {number} [props.options.xAxis.width] - Width of xAxis.
 *        @param {number} [props.options.xAxis.height] - Height of xAxis.
 *      @param {Object|Array<Object>} [props.options.yAxis] - If this option is an array type, use the secondary y axis.
 *        @param {Object} [props.options.yAxis.title] - Axis title.
 *        @param {Object} [props.options.yAxis.tick] - You can change the tick interval through the tick.interval option.
 *        @param {Object} [props.options.yAxis.label] - You can change the tick interval through the label.interval option.
 *        @param {Object} [props.options.yAxis.scale] - You can change axis minimum, maximum, step size value with scale option.
 *        @param {number} [props.options.yAxis.width] - Width of yAxis.
 *        @param {number} [props.options.yAxis.height] - Height of yAxis.
 *      @param {Object} [props.options.plot]
 *        @param {number} [props.options.plot.width] - Width of plot.
 *        @param {number} [props.options.plot.height] - Height of plot.
 *        @param {boolean} [props.options.plot.showLine] - Whether to show plot line.
 *        @param {Array<Object>} [props.options.plot.lines] - Plot lines information. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Plot guide} on github.
 *        @param {Array<Object>} [props.options.plot.bands] - Plot bands information. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Plot guide} on github.
 *      @param {Object} [props.options.legend]
 *        @param {string} [props.options.legend.align] - Legend align. 'top', 'bottom', 'right', 'left' is available.
 *        @param {string} [props.options.legend.showCheckbox] - Whether to show checkbox.
 *        @param {boolean} [props.options.legend.visible] - Whether to show legend.
 *        @param {number} [props.options.legend.maxWidth] - Max width of legend.
 *        @param {number} [props.options.legend.width] - Width of legend.
 *      @param {Object} [props.options.exportMenu]
 *        @param {boolean} [props.options.exportMenu.visible] - Whether to show export menu.
 *        @param {string} [props.options.exportMenu.filename] - File name applied when downloading.
 *      @param {Object} [props.options.tooltip]
 *        @param {number} [props.options.tooltip.offsetX] - Offset value to move title horizontally.
 *        @param {number} [props.options.tooltip.offsetY] - Offset value to move title vertically.
 *        @param {Function} [props.options.tooltip.formatter] - Function to format data value.
 *        @param {Function} [props.options.tooltip.template] - Function to create custom template. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Tooltip guide} on github.
 *      @param {Object} [props.options.responsive] - Rules for changing chart options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Responsive guide} on github.
 *        @param {boolean|Object} [props.options.responsive.animation] - Animation duration when the chart is modified.
 *        @param {Array<Object>} [props.options.responsive.rules] - Rules for the Chart to Respond.
 *      @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Line Chart guide} on github.
 *        @param {Object} [props.options.theme.chart] - Chart font theme.
 *        @param {Object} [props.options.theme.series] - Series theme.
 *        @param {Object} [props.options.theme.title] - Title theme.
 *        @param {Object} [props.options.theme.xAxis] - X Axis theme.
 *        @param {Object|Array<Object>} [props.options.theme.yAxis] - Y Axis theme. In the case of an arrangement, the first is the main axis and the second is the theme for the secondary axis.
 *        @param {Object} [props.options.theme.legend] - Legend theme.
 *        @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *        @param {Object} [props.options.theme.plot] - Plot theme.
 *        @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 * @extends Chart
 */
export default class LineChart extends Chart<LineChartOptions> {
  modules = [dataRange, scale, axes, plot];

  constructor(props: LineChartProps) {
    super({
      el: props.el,
      options: props.options,
      series: {
        line: props.data.series as LineSeriesType[],
      },
      categories: props.data?.categories,
    });
  }

  initialize() {
    super.initialize();

    this.componentManager.add(Title);
    this.componentManager.add(Plot);
    this.componentManager.add(Legend);
    this.componentManager.add(LineSeries);
    this.componentManager.add(Axis, { name: 'yAxis' });
    this.componentManager.add(Axis, { name: 'xAxis' });
    this.componentManager.add(Axis, { name: 'secondaryYAxis' });
    this.componentManager.add(DataLabels);
    this.componentManager.add(AxisTitle, { name: 'xAxis' });
    this.componentManager.add(AxisTitle, { name: 'yAxis' });
    this.componentManager.add(AxisTitle, { name: 'secondaryYAxis' });
    this.componentManager.add(ExportMenu, { chartEl: this.el });
    this.componentManager.add(HoveredSeries);
    this.componentManager.add(SelectedSeries);
    this.componentManager.add(Tooltip, { chartEl: this.el });
    this.componentManager.add(Zoom);
    this.componentManager.add(ResetButton);

    this.painter.addGroups([
      basicBrush,
      axisBrush,
      lineSeriesBrush,
      legendBrush,
      labelBrush,
      exportMenuBrush,
      dataLabelBrush,
      resetButtonBrush,
    ]);
  }

  /**
   * Add data.
   * @param {Array} data - Array of data to be added.
   * @param {string} category - Category to be added.
   * @api
   * @example
   * chart.addData([10, 20], '6');
   */
  public addData = (data: LineSeriesDataType[], category?: string) => {
    this.store.dispatch('addData', { data, category });
  };

  /**
   * Add series.
   * @param {Object} data - Data to be added.
   * @param {string} data.name - Series name.
   * @param {Array} data.data - Array of data to be added.
   * @api
   * @example
   * chart.addSeries({
   *   name: 'newSeries',
   *   data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
   * });
   */
  public addSeries(data: LineSeriesInput) {
    this.store.dispatch('addSeries', { data });
  }

  /**
   * Convert the chart data to new data.
   * @param {Object} data - Data to be set.
   * @api
   * @example
   * chart.setData({
   *   categories: ['1','2','3'],
   *   series: [
   *     {
   *       name: 'new series',
   *       data: [1, 2, 3],
   *     },
   *     {
   *       name: 'new series2',
   *       data: [4, 5, 6],
   *     }
   *   ]
   * });
   */
  public setData(data: LineSeriesData) {
    const { categories, series } = data;
    this.store.dispatch('setData', { series: { line: series }, categories });
  }

  /**
   * Add plot line.
   * @param {Object} data - Plot info.
   * @param {string|number} data.value - The value where the plot line will be drawn.
   * @param {string} data.color - Plot line color.
   * @param {string} [data.id] - Plot id. The value on which the removePlotLine is based.
   * @api
   * @example
   * chart.addPlotLine({
   *   value: 2,
   *   color: '#00ff22',
   *   id: 'plot-1'
   * });
   */
  public addPlotLine(data: PlotLine) {
    this.store.dispatch('addPlotLine', { data });
  }

  /**
   * Remove plot line with id.
   * @param {string} id - Id of the plot line to be removed.
   * @api
   * @example
   * chart.removePlotLine('plot-1');
   */
  public removePlotLine(id: string) {
    this.store.dispatch('removePlotLine', { id });
  }

  /**
   * Add plot band.
   * @param {Object} data - Plot info.
   * @param {Array<string|number>} data.range - The range to be drawn.
   * @param {string} data.color - Plot band color.
   * @param {string} [data.id] - Plot id. The value on which the removePlotBand is based.
   * @api
   * @example
   * chart.addPlotBand({
   *   value: [2, 4],
   *   color: '#00ff22',
   *   id: 'plot-1'
   * });
   */
  public addPlotBand(data: PlotBand) {
    this.store.dispatch('addPlotBand', { data });
  }

  /**
   * Remove plot band with id.
   * @param {string} id - id of the plot band to be removed
   * @api
   * @example
   * chart.removePlotBand('plot-1');
   */
  public removePlotBand(id: string) {
    this.store.dispatch('removePlotBand', { id });
  }

  /**
   * Hide series data label.
   * @api
   * @example
   * chart.hideSeriesLabel();
   */
  public hideSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: false } } });
  };

  /**
   * Show series data label.
   * @api
   * @example
   * chart.showSeriesLabel();
   */
  public showSeriesLabel = () => {
    this.store.dispatch('updateOptions', { series: { dataLabels: { visible: true } } });
  };

  /**
   * Convert the chart options to new options.
   * @param {Object} options - Chart options.
   * @api
   * @example
   * chart.setOptions({
   *   chart: {
   *     width: 500,
   *     height: 'auto',
   *     title: 'Energy Usage',
   *   },
   *   xAxis: {
   *     title: 'Month',
   *     date: { format: 'yy/MM' },
   *   },
   *   yAxis: {
   *     title: 'Energy (kWh)',
   *   },
   *   series: {
   *     selectable: true
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public setOptions = (options: LineChartOptions) => {
    this.dispatchOptionsEvent('initOptions', options);
  };

  /**
   * Update chart options.
   * @param {Object} options - Chart options.
   * @api
   * @example
   * chart.updateOptions({
   *   chart: {
   *     height: 'auto',
   *     title: 'Energy Usage',
   *   },
   *   tooltip: {
   *     formatter: (value) => `${value}kWh`,
   *   },
   * });
   */
  public updateOptions = (options: LineChartOptions) => {
    this.dispatchOptionsEvent('updateOptions', options);
  };

  /**
   * Show tooltip.
   * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
   *      @param {number} seriesInfo.index - Index of data within series. If eventType is 'grouped', only seriesIndex is needed.If eventType is 'grouped', only seriesIndex is needed.
   *      @param {number} [seriesInfo.seriesIndex] - Index of series.
   * @api
   * @example
   * chart.showTooltip({index: 1, seriesIndex: 2});
   */
  public showTooltip = (seriesInfo: SelectSeriesInfo) => {
    this.eventBus.emit('showTooltip', { ...seriesInfo });
  };

  /**
   * Hide tooltip.
   * @api
   * @example
   * chart.hideTooltip();
   */
  public hideTooltip = () => {
    this.eventBus.emit('hideTooltip');
  };
}
