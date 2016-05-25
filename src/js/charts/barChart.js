/**
 * @fileoverview Bar chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');
var barTypeMixer = require('./barTypeMixer');
var predicate = require('../helpers/predicate');
var Series = require('../series/barChartSeries');

var BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {
    /**
     * Bar chart.
     * @constructs BarChart
     * @extends ChartBase
     * @mixes axisTypeMixer
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        /**
         * className
         * @type {string}
         */
        this.className = 'tui-bar-chart';

        /**
         * Whether has right y axis or not.
         * @type {boolean}
         */
        this.hasRightYAxis = false;

        options.yAxis = options.yAxis || {};
        options.xAxis = options.xAxis || {};
        options.plot = options.plot || {};
        options.series = options.series || {};

        if (predicate.isValidStackOption(options.series.stackType)) {
            rawData.series = this._sortRawSeriesData(rawData.series);
        }

        if (options.series.diverging) {
            rawData.series = this._makeRawSeriesDataForDiverging(rawData.series, options.series.stackType);
            this._updateDivergingOption(options);
        }

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Update options for diverging option.
     * @param {object} options options
     * @private
     */
    _updateDivergingOption: function(options) {
        var isCenter;

        options.series.stackType = options.series.stackType || chartConst.NORMAL_STACK_TYPE;
        this.hasRightYAxis = tui.util.isArray(options.yAxis) && options.yAxis.length > 1;

        isCenter = predicate.isYAxisAlignCenter(this.hasRightYAxis, options.yAxis.align);

        options.yAxis.isCenter = isCenter;
        options.xAxis.divided = isCenter;
        options.series.divided = isCenter;
        options.plot.divided = isCenter;
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        return {
            xAxis: this._createAxisScaleMaker(this.options.xAxis, 'xAxis')
        };
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        var axes = [
            {
                name: 'yAxis',
                isLabel: true
            },
            {
                name: 'xAxis'
            }
        ];

        if (this.hasRightYAxis) {
            axes.push({
                name: 'rightYAxis',
                isLabe: true
            });
        }
        this._addComponentsForAxisType({
            axes: axes,
            chartType: chartType,
            serieses: [
                {
                    name: 'barSeries',
                    SeriesClass: Series
                }
            ]
        });
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var boundParams;

        if (this.hasRightYAxis) {
            boundParams = {
                optionChartTypes: ['bar', 'bar']
            };
        }

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, null, boundParams);
    }
});

axisTypeMixer.mixin(BarChart);
barTypeMixer.mixin(BarChart);

module.exports = BarChart;
