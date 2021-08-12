import Chart from "./chart";
import dataRange from "../store/dataRange";
import scale from "../store/scale";
import radialAxes from "../store/radialAxes";
import Legend from "../component/legend";
import RadarSeries from "../component/radarSeries";
import RadialPlot from "../component/radialPlot";
import Title from "../component/title";
import ExportMenu from "../component/exportMenu";
import SelectedSeries from "../component/selectedSeries";
import HoveredSeries from "../component/hoveredSeries";
import Tooltip from "../component/tooltip";
import RadialAxis from "../component/radialAxis";
import Background from "../component/background";
import NoDataText from "../component/noDataText";
import * as basicBrush from "../brushes/basic";
import * as legendBrush from "../brushes/legend";
import * as labelBrush from "../brushes/label";
import * as exportMenuBrush from "../brushes/exportMenu";
import * as polygonBrush from "../brushes/polygon";
import * as axisBrush from "../brushes/axis";
import * as lineSeriesBrush from "../brushes/lineSeries";
/**
 * @class
 * @classdesc Radar Chart
 * @param {Object} props
 *   @param {HTMLElement} props.el - The target element to create chart.
 *   @param {Object} props.data - Data for making Radar Chart.
 *     @param {Array<string>} props.data.categories - Categories.
 *     @param {Array<Object>} props.data.series - Series data.
 *       @param {string} props.data.series.name - Series name.
 *       @param {Array<number>} props.data.series.data - Series data.
 *   @param {Object} [props.options] - Options for making Radar Chart.
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
 *       @param {boolean} [props.options.series.showDot=false] - Whether to show dot or not.
 *       @param {boolean} [props.options.series.showArea=false] - Whether to fill area or not.
 *     @param {Object} [props.options.circularAxis]
 *       @param {Object} [props.options.circularAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.circularAxis.label] - Option to adjust label interval.
 *     @param {Object} [props.options.verticalAxis]
 *       @param {Object} [props.options.verticalAxis.tick] - Option to adjust tick interval.
 *       @param {Object} [props.options.verticalAxis.label] - Option to adjust label interval.
 *       @param {Object} [props.options.verticalAxis.scale] - Option to adjust axis minimum, maximum, step size.
 *     @param {Object} [props.options.plot]
 *       @param {number} [props.options.plot.width] - Width of plot.
 *       @param {number} [props.options.plot.height] - Height of plot.
 *       @param {boolean} [props.options.plot.type] - Radar plot type. 'spiderweb', 'circle' is available.
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
 *     @param {Object} [props.options.theme] - Chart theme options. For specific information, refer to the {@link https://github.com/nhn/tui.chart|Radar Chart guide} on github.
 *       @param {Object} [props.options.theme.chart] - Chart font theme.
 *       @param {Object} [props.options.theme.noData] - No Data Layer Text theme.
 *       @param {Object} [props.options.theme.series] - Series theme.
 *       @param {Object} [props.options.theme.title] - Title theme.
 *       @param {Object} [props.options.theme.circularAxis] - Circular Axis theme.
 *       @param {Object} [props.options.theme.verticalAxis] - Vertical Axis theme.
 *       @param {Object} [props.options.theme.legend] - Legend theme.
 *       @param {Object} [props.options.theme.tooltip] - Tooltip theme.
 *       @param {Object} [props.options.theme.plot] - Plot theme.
 *       @param {Object} [props.options.theme.exportMenu] - ExportMenu theme.
 * @extends Chart
 */
export default class RadarChart extends Chart {
    constructor({ el, options, data }) {
        super({
            el,
            options,
            series: {
                radar: data.series,
            },
            categories: data.categories,
            modules: [dataRange, scale, radialAxes],
        });
    }
    initialize() {
        super.initialize();
        this.componentManager.add(Background);
        this.componentManager.add(Title);
        this.componentManager.add(Legend);
        this.componentManager.add(RadialPlot);
        this.componentManager.add(RadialAxis);
        this.componentManager.add(RadarSeries);
        this.componentManager.add(ExportMenu, { chartEl: this.el });
        this.componentManager.add(HoveredSeries);
        this.componentManager.add(SelectedSeries);
        this.componentManager.add(Tooltip, { chartEl: this.el });
        this.componentManager.add(NoDataText);
        this.painter.addGroups([
            basicBrush,
            legendBrush,
            labelBrush,
            exportMenuBrush,
            polygonBrush,
            axisBrush,
            lineSeriesBrush,
        ]);
    }
    /**
     * Add data.
     * @param {Array<number>} data - Array of data to be added.
     * @param {string} category - Category to be added.
     * @api
     * @example
     * chart.addData([10, 20], '6');
     */
    addData(data, category) {
        this.animationControlFlag.updating = true;
        this.resetSeries();
        this.store.dispatch('addData', { data, category });
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
     *   data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
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
        this.store.dispatch('setData', { series: { radar: series }, categories });
    }
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
     *   series: {
     *     selectable: true,
     *   },
     *   tooltip: {
     *     formatter: (value) => `${value}kWh`,
     *   },
     * });
     */
    setOptions(options) {
        this.dispatchOptionsEvent('initOptions', options);
    }
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
    updateOptions(options) {
        this.resetSeries();
        this.dispatchOptionsEvent('updateOptions', options);
    }
    /**
     * Show tooltip.
     * @param {Object} seriesInfo - Information of the series for the tooltip to be displayed.
     *      @param {number} seriesInfo.seriesIndex - Index of series.
     *      @param {number} seriesInfo.index - Index of data within series.
     * @api
     * @example
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
