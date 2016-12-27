/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var pieTypeMixer = require('./pieTypeMixer');
var chartConst = require('../const');

var PieChart = tui.util.defineClass(ChartBase, /** @lends PieChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-pie-chart',

    /**
     * Pie chart.
     * @constructs PieChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options
        });
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
        this._addLegendComponent();
        this._addTooltipComponent({
            labelFormatter: this.labelFormatter
        });
        this._addSeriesComponents([{
            name: 'pieSeries',
            additionalParams: {
                chartType: this.chartType
            }
        }]);
        this._addMouseEventDetectorComponent();
    },

    /**
     * Add data ratios.
     * @private
     * @override
     */
    _addDataRatios: function() {
        this.dataProcessor.addDataRatiosOfPieChart(this.chartType);
    },

    /**
     * Send series data.
     * @private
     * @override
     */
    _sendSeriesData: function() {
        ChartBase.prototype._sendSeriesData.call(this, chartConst.CHART_TYPE_PIE);
    }
});

tui.util.extend(PieChart.prototype, pieTypeMixer);

module.exports = PieChart;
