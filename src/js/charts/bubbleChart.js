/**
 * @fileoverview Bubble chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');

var BubbleChart = snippet.defineClass(ChartBase, /** @lends BubbleChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-bubble-chart',
    /**
     * Bubble chart.
     * @constructs BubbleChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        options.tooltip = options.tooltip || {};
        options.circleLegend = options.circleLegend || {};

        if (!options.tooltip.align) {
            options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
        }

        if (snippet.isUndefined(options.circleLegend.visible)) {
            options.circleLegend.visible = true;
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });
    },

    /**
     * Get scale option.
     * @returns {{xAxis: ?{valueType:string}, yAxis: ?{valueType:string}}}
     * @override
     */
    getScaleOption: function() {
        var scaleOption = {};

        if (this.dataProcessor.hasXValue(this.chartType)) {
            scaleOption.xAxis = {
                valueType: 'x'
            };
        }
        if (this.dataProcessor.hasYValue(this.chartType)) {
            scaleOption.yAxis = {
                valueType: 'y'
            };
        }

        return scaleOption;
    },

    /**
     * Set default options.
     * @param {object} options - options for bubble chart
     * @private
     * @override
     */
    _setDefaultOptions: function(options) {
        ChartBase.prototype._setDefaultOptions.call(this, options);
        this.options.circleLegend = this.options.circleLegend || {};

        if (snippet.isUndefined(this.options.circleLegend.visible)) {
            this.options.circleLegend.visible = true;
        }
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
        this.componentManager.register('title', 'title');
        this.componentManager.register('plot', 'plot');
        this.componentManager.register('legend', 'legend');
        this.componentManager.register('circleLegend', 'circleLegend');

        this.componentManager.register('bubbleSeries', 'bubbleSeries');

        this.componentManager.register('yAxis', 'axis');
        this.componentManager.register('xAxis', 'axis');

        this.componentManager.register('chartExportMenu', 'chartExportMenu');
        this.componentManager.register('tooltip', 'tooltip');
        this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    },
    /**
     * Add data ratios.
     * @override
     */
    addDataRatios: function(limitMap) {
        this.dataProcessor.addDataRatiosForCoordinateType(this.chartType, limitMap, true);
    }
});

module.exports = BubbleChart;
