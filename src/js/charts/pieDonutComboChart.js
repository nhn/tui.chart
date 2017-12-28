/**
 * @fileoverview Pie and Donut Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var snippet = require('tui-code-snippet');

var PieDonutComboChart = snippet.defineClass(ChartBase, /** @lends PieDonutComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',

    /**
     * Pie and Donut Combo chart.
     * @constructs PieDonutComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * chart types.
         * @type {Array.<string>}
         */
        this.seriesTypes = snippet.keys(rawData.series).sort();

        /**
         * chart types
         * @type {Object}
         */
        this.chartTypes = ['pie', 'pie'];

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            isVertical: true
        });
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('pie1Series', 'pieSeries');
        this.componentManager.register('pie2Series', 'pieSeries');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },
    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function() {
        var self = this;
        var seriesTypes = this.seriesTypes || [this.chartType];

        snippet.forEachArray(seriesTypes, function(chartType) {
            self.dataProcessor.addDataRatiosOfPieChart(chartType);
        });
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var originalRawData = this.dataProcessor.getOriginalRawData();
        var rawData = rawDataHandler.filterCheckedRawData(originalRawData, checkedLegends);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, {
            seriesTypes: this.seriesTypes
        });
    }
});

module.exports = PieDonutComboChart;
