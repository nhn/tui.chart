/**
 * @fileoverview Pie chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');

var PieChart = snippet.defineClass(ChartBase, /** @lends PieChart.prototype */ {
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
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('pieSeries', 'pieSeries');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },

    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function() {
        this.dataProcessor.addDataRatiosOfPieChart(this.chartType);
    }
});

module.exports = PieChart;
