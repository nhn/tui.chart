/**
 * @fileoverview Line and Scatter Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var snippet = require('tui-code-snippet');

var LineScatterComboChart = snippet.defineClass(ChartBase, /** @lends LineScatterComboChart.prototype */ {
    /**
     * Line and Scatter Combo chart.
     * @constructs LineScatterComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     */
    init: function(rawData, theme, options) {
        /**
         * chart types map
         * @type {Object}
         */
        this.chartTypes = ['line', 'scatter'];

        /**
         * series types
         * @type {Object|Array.<T>}
         */
        this.seriesTypes = ['line', 'scatter'];

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Get scale option.
     * @returns {{
     *      yAxis: {valueType: string, additionalOptions: {isSingleYAxis: boolean}},
     *      xAxis: {valueType: string}
     * }}
     * @override
     */
    getScaleOption: function() {
        return {
            yAxis: {
                valueType: 'y'
            },
            xAxis: {
                valueType: 'x'
            }
        };
    },

    /**
     * Add data ratios.
     * @override
     * from axisTypeMixer
     */
    addDataRatios: function(limitMap) {
        var self = this;
        var chartTypes = this.chartTypes || [this.chartType];
        var addDataRatio;

        addDataRatio = function(chartType) {
            self.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, false);
        };

        snippet.forEachArray(chartTypes, addDataRatio);
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');

        this.componentManager.register('lineSeries', 'lineSeries');
        this.componentManager.register('scatterSeries', 'scatterSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    }
});

module.exports = LineScatterComboChart;
