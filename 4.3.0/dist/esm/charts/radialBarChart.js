import Chart from "./chart";
import dataRange from "../store/dataRange";
import stackSeriesData from "../store/stackSeriesData";
import scale from "../store/scale";
import radialAxes from "../store/radialAxes";
import Tooltip from "../component/tooltip";
import Legend from "../component/legend";
import RadialBarSeries from "../component/radialBarSeries";
import Title from "../component/title";
import ExportMenu from "../component/exportMenu";
import HoveredSeries from "../component/hoveredSeries";
import DataLabels from "../component/dataLabels";
import SelectedSeries from "../component/selectedSeries";
import Background from "../component/background";
import RadialPlot from "../component/radialPlot";
import RadialAxis from "../component/radialAxis";
import NoDataText from "../component/noDataText";
import * as basicBrush from "../brushes/basic";
import * as legendBrush from "../brushes/legend";
import * as labelBrush from "../brushes/label";
import * as exportMenuBrush from "../brushes/exportMenu";
import * as sectorBrush from "../brushes/sector";
import * as dataLabelBrush from "../brushes/dataLabel";
import * as axisBrush from "../brushes/axis";
/**
 * @class
 * @classdesc RadialBar Chart
 * @param {Object} props
 *   @param {HTMLElement} props.el - The target element to create chart.
 *   @param {Object} props.data - Data for making RadialBar Chart.
 *     @param {Array<string>} [props.data.categories] - Categories.
 *     @param {Array<Object>} props.data.series - Series data.
 *       @param {string} props.data.series.name - Series name.
 *       @param {number} props.data.series.data - Series data.
 *   @param {Object} [props.options] - Options for making RadialBar Chart.
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
 *       @param {string} [props.options.series.eventDetectType] - Event detect type. 'grouped', 'point' is available.
 *       @param {Object} [props.options.series.dataLabels] - Set the visibility, location, and formatting of dataLabel. For specific information, refer to the {@link https://github.com/nhn/tui.chart|DataLabels guide} on github.
 *       @param {Array<number>|Array<string>} [props.options.series.radiusRange] - Specifies the radius of the circle drawn. It is specified by entering a number or percent string value in start and end.
 *       @param {Array<number>} [props.options.series.angleRange] - The range of angles to which the circle will be drawn. It is specified by putting number in start and end.
 *       @param {boolean} [props.options.series.clockwise] - Whether it will be drawn clockwise.
 *     @param {Object} [props.options.circularAxis]
 *       @param {Object} [props.options.circularAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.circularAxis.label] - Option to adjust label interval.
 *       @param {Object} [props.options.circularAxis.scale] - Option to adjust axis minimum, maximum, step size.
 *     @param {Object} [props.options.verticalAxis]
 *       @param {Object} [props.options.verticalAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.verticalAxis.label] - Option to adjust label interval.
 *     @param {Object} [props.options.legend]
 *       @param {string} [props.options.legend.align] - Legend align. 'top', 'bottom', 'right', 'left' is available.
 *       @param {string} [props.options.legend.showCheckbox] - Whether to show checkbox.
 *       @param {boolean} [props.options.legend.visible] - Whether to show legend.
 *       @param {number} [props.options.legend.width] - Width of legend.
 *       @param {Object} [props.options.legend.item] - `width` and `overflow` options of the legend item. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Legend guide} on github.
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
 *     @param {Object} [props.options.lang] - Options for changing the text displayed on the chart or i18n languages.
 *       @param {Object} [props.options.lang.noData] - No Data Layer Text.
 *     @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|RadialBar Chart guide} on github.
 *       @param {Object} [props.options.theme.chart] - Chart font theme.
 *       @param {Object} [props.options.theme.noData] - No Data Layer Text theme.
 *       @param {Object} [props.options.theme.series] - Series theme.
 *       @param {Object} [props.options.theme.title] - Title theme.
 *       @param {Object} [props.options.theme.circularAxis] - Circular Axis theme.
 *       @param {Object} [props.options.theme.verticalAxis] - Vertical Axis theme.
 *       @param {Object} [props.options.theme.legend] - Legend theme.
 *       @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *       @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 * @extends Chart
 */
export default class RadialBarChart extends Chart {
    constructor({ el, options, data }) {
        super({
            el,
            options,
            series: {
                radialBar: data.series,
            },
            categories: data.categories,
            modules: [stackSeriesData, dataRange, scale, radialAxes],
        });
    }
    initialize() {
        super.initialize();
        this.componentManager.add(Background);
        this.componentManager.add(Title);
        this.componentManager.add(Legend);
        this.componentManager.add(RadialPlot);
        this.componentManager.add(RadialBarSeries);
        this.componentManager.add(HoveredSeries);
        this.componentManager.add(SelectedSeries);
        this.componentManager.add(DataLabels);
        this.componentManager.add(RadialAxis);
        this.componentManager.add(ExportMenu, { chartEl: this.el });
        this.componentManager.add(Tooltip, { chartEl: this.el });
        this.componentManager.add(NoDataText);
        this.painter.addGroups([
            basicBrush,
            legendBrush,
            labelBrush,
            exportMenuBrush,
            sectorBrush,
            dataLabelBrush,
            axisBrush,
        ]);
    }
    /**
     * Add series.
     * @param {Object} data - Data to be added.
     *   @param {string} data.name - Series name.
     *   @param {Array<number>} data.data - Array of data to be added.
     * @api
     * @example
     * chart.addSeries({
     *   name: 'newSeries',
     *   data: [10, 20, 30, 40],
     * });
     */
    addSeries(data) {
        this.resetSeries();
        this.store.dispatch('addSeries', { data });
    }
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
    setData(data) {
        const { categories, series } = data;
        this.resetSeries();
        this.store.dispatch('setData', { series: { radialBar: series }, categories });
    }
    /**
     * Hide series data label.
     * @api
     * @example
     * chart.hideSeriesDataLabel();
     */
    hideSeriesDataLabel() {
        this.store.dispatch('updateOptions', {
            options: { series: { dataLabels: { visible: false } } },
        });
    }
    /**
     * Show series data label.
     * @api
     * @example
     * chart.showSeriesDataLabel();
     */
    showSeriesDataLabel() {
        this.store.dispatch('updateOptions', {
            options: { series: { dataLabels: { visible: true } } },
        });
    }
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
    setOptions(options) {
        this.resetSeries();
        this.dispatchOptionsEvent('initOptions', options);
    }
    /**
     * Update chart options.
     * @param {Object} options - Chart options.
     * @api
     * @example
     * chart.updateOptions({
     *   chart: {
     *     title: 'Olympic Medals',
     *   },
     *   series: {
     *     eventDetectType: 'grouped'
     *   }
     * });
     */
    updateOptions(options) {
        this.resetSeries();
        this.dispatchOptionsEvent('updateOptions', options);
    }
    /**
     * Show tooltip.
     * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
     *      @param {number} seriesInfo.index - Index of data within series. If 'series.eventDetectType' is "grouped", only index is needed.
     *      @param {number} [seriesInfo.seriesIndex] - Index of series
     * @api
     * @example
     * // eventDetectType is 'grouped'
     * chart.showTooltip({index: 1});
     *
     * // eventDetectType is 'point'
     * chart.showTooltip({index: 1, seriesIndex: 2});
     */
    showTooltip(seriesInfo) {
        this.eventBus.emit('showTooltip', Object.assign(Object.assign({}, seriesInfo), { state: this.store.state }));
    }
    /**
     * Hide tooltip.
     * @api
     * @example
     * chart.hideTooltip();
     */
    hideTooltip() {
        this.eventBus.emit('hideTooltip');
    }
}
