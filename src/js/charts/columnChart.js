/**
 * @fileoverview Column chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var rawDataHandler = require('../models/data/rawDataHandler');

var ColumnChart = tui.util.defineClass(ChartBase, /** @lends ColumnChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-column-chart',
    /**
     * Column chart.
     * @constructs ColumnChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @mixes verticalTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        rawDataHandler.updateRawSeriesDataByOptions(rawData, options.series);
        this._updateOptionsRelatedDiverging(options);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * Update options related diverging option.
     * @param {object} options - options
     * @private
     */
    _updateOptionsRelatedDiverging: function(options) {
        options.series = options.series || {};

        if (options.series.diverging) {
            options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
        }
    },

    /**
     * Add components
     * @private
     */
    _addComponents: function() {
        var chartOptions = this.options.chart || {};

        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: 'columnSeries',
                    data: {
                        allowNegativeTooltip: true
                    }
                }
            ],
            plot: true,
            title: chartOptions.title
        });
    },

    /**
     * Get scale option.
     * @returns {{yAxis: boolean}}
     * @private
     * @override
     */
    _getScaleOption: function() {
        return {
            yAxis: true
        };
    }
});

tui.util.extend(ColumnChart.prototype, axisTypeMixer);

module.exports = ColumnChart;
