import Chart from "./chart";
import { GaugeChartOptions, GaugeSeriesData, GaugeSeriesDataType, GaugeSeriesInput, GaugePlotBand } from "../../types/options";
import { GaugeChartProps, SelectSeriesInfo } from "../../types/charts";
/**
 * @class
 * @classdesc Gauge Chart
 * @param {Object} props
 *   @param {HTMLElement} props.el - The target element to create chart.
 *   @param {Object} props.data - Data for making Gauge Chart.
 *     @param {Array<string>} [props.data.categories] - Categories.
 *     @param {Array<Object>} props.data.series - Series data.
 *       @param {string} props.data.series.name - Series name.
 *       @param {number} props.data.series.data - Series data.
 *   @param {Object} [props.options] - Options for making Gauge Chart.
 *     @param {Object} [props.options.chart]
 *       @param {string|Object} [props.options.chart.title] - Chart title text or options.
 *         @param {string} [props.options.chart.title.text] - Chart title text.
 *         @param {number} [props.options.chart.title.offsetX] - Offset value to move title horizontally.
 *         @param {number} [props.options.chart.title.offsetY] - Offset value to move title vertically.
 *         @param {string} [props.options.chart.title.align] - Chart text align. 'left', 'right', 'center' is available.
 *       @param {boolean|Object} [props.options.chart.animation] - Whether to use animation and duration when rendering the initial chart.
 *       @param {number|string} [props.options.chart.width] - Chart width. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the width of the parent container is followed.
 *       @param {number|string} [props.options.chart.height] - Chart height. 'auto' or if not write, the width of the parent container is followed. 'auto' or if not created, the height of the parent container is followed.
 *     @param {Object} [props.options.series]
 *       @param {boolean} [props.options.series.selectable=false] - Whether to make selectable series or not.
 *       @param {Object} [props.options.series.dataLabels] - Set the visibility, location, and formatting of dataLabel. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Gauge Chart guide} on github.
 *       @param {Array<number>} [props.options.series.angleRange] - The range of angles to which the circle will be drawn. It is specified by putting number in start and end.
 *       @param {boolean} [props.options.series.clockwise] - Whether it will be drawn clockwise.
 *       @param {boolean | Object} [props.options.series.solid] - When this option is set, the radial bar is displayed. It can be used when there is one series data. The default value is 'false'.
 *     @param {Object} [props.options.circularAxis]
 *       @param {string|Object} [props.options.circularAxis.title] - Axis title.
 *       @param {Object} [props.options.circularAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.circularAxis.label] - Option to adjust label interval.
 *       @param {Object} [props.options.circularAxis.scale] - Option to adjust axis minimum, maximum, step size.
 *     @param {Object} [props.options.plot]
 *       @param {number} [props.options.plot.width] - Width of plot.
 *       @param {number} [props.options.plot.height] - Height of plot.
 *       @param {Array<Object>} [props.options.plot.bands] - Plot bands information. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Gauge Chart guide} on github.
 *     @param {Object} [props.options.exportMenu]
 *       @param {boolean} [props.options.exportMenu.visible] - Whether to show export menu.
 *       @param {string} [props.options.exportMenu.filename] - File name applied when downloading.
 *     @param {Object} [props.options.tooltip]
 *       @param {number} [props.options.tooltip.offsetX] - Offset value to move title horizontally.
 *       @param {number} [props.options.tooltip.offsetY] - Offset value to move title vertically.
 *       @param {Function} [props.options.tooltip.formatter] - Function to format data value.
 *       @param {Function} [props.options.tooltip.template] - Function to create custom template. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Tooltip guide} on github.
 *     @param {Object} [props.options.responsive] - Rules for changing chart options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Responsive guide} on github.
 *       @param {boolean|Object} [props.options.responsive.animation] - Animation duration when the chart is modified.
 *       @param {Array<Object>} [props.options.responsive.rules] - Rules for the Chart to Respond.
 *     @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Gauge Chart guide} on github.
 *       @param {Object} [props.options.theme.chart] - Chart font theme.
 *       @param {Object} [props.options.theme.series] - Series theme.
 *       @param {Object} [props.options.theme.title] - Title theme.
 *       @param {Object} [props.options.theme.circularAxis] - Circular Axis theme.
 *       @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *       @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 *       @param {Object} [props.options.theme.plot] - Plot Theme.
 * @extends Chart
 */
export default class GaugeChart extends Chart<GaugeChartOptions> {
    constructor({ el, options, data }: GaugeChartProps);
    protected initialize(): void;
    /**
     * Add series.
     * @param {Object} data - Data to be added.
     *   @param {string} data.name - Series name.
     *   @param {Array<number|Array<number>>} data.data - Array of data to be added.
     * @api
     * @example
     * chart.addSeries({
     *   name: 'newSeries',
     *   data: [10, 20],
     * });
     */
    addSeries(data: GaugeSeriesInput): void;
    /**
     * Add data.
     * @param {Array} data - Array of data to be added.
     * @param {string} [category] - Category to be added.
     * @api
     * @example
     * // without categories
     * chart.addData([10], '6');
     *
     * // with categories
     * chart.addData([10], '6');
     */
    addData(data: GaugeSeriesDataType[], category?: string): void;
    /**
     * Convert the chart data to new data.
     * @param {Object} data - Data to be set.
     * @api
     * @example
     * chart.setData({
     *   categories: ['1', '2', '3'],
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
    setData(data: GaugeSeriesData): void;
    /**
     * Hide series data label.
     * @api
     * @example
     * chart.hideSeriesDataLabel();
     */
    hideSeriesDataLabel(): void;
    /**
     * Show series data label.
     * @api
     * @example
     * chart.showSeriesDataLabel();
     */
    showSeriesDataLabel(): void;
    /**
     * Convert the chart options to new options.
     * @param {Object} options - Chart options.
     * @api
     * @example
     * chart.setOptions({
     *   chart: {
     *     width: 500,
     *     height: 500,
     *     title: 'Olympic Medals',
     *   },
     *   series: {
     *     selectable: true
     *   }
     * });
     */
    setOptions(options: GaugeChartOptions): void;
    /**
     * Update chart options.
     * @param {Object} options - Chart options.
     * @api
     * @example
     * chart.updateOptions({
     *   chart: {
     *     title: 'Olympic Medals',
     *   }
     * });
     */
    updateOptions(options: GaugeChartOptions): void;
    /**
     * Show tooltip.
     * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
     *      @param {number} seriesInfo.index - Index of data within series.
     * @api
     * @example
     * chart.showTooltip({index: 1});
     */
    showTooltip(seriesInfo: SelectSeriesInfo): void;
    /**
     * Hide tooltip.
     * @api
     * @example
     * chart.hideTooltip();
     */
    hideTooltip(): void;
    /**
     * Add plot band.
     * @param {Object} data - Plot info.
     *   @param {Array<string|number>} data.range - The range to be drawn.
     *   @param {string} data.color - Plot band color.
     *   @param {string} [data.id] - Plot id. The value on which the removePlotBand is based.
     * @api
     * @example
     * chart.addPlotBand({
     *   range: [10, 20],
     *   color: '#00ff22',
     *   id: 'plot-1',
     * });
     */
    addPlotBand(data: GaugePlotBand): void;
    /**
     * Remove plot band with id.
     * @param {string} id - id of the plot band to be removed
     * @api
     * @example
     * chart.removePlotBand('plot-1');
     */
    removePlotBand(id: string): void;
}
