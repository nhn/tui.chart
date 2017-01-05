/**
 * @fileoverview Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
 *                  to display values for typically two variables for a set of data.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var chartConst = require('../const');
var axisTypeMixer = require('./axisTypeMixer');

var ScatterChart = tui.util.defineClass(ChartBase, /** @lends ScatterChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-scatter-chart',
    /**
     * Scatter chart is a type of plot or mathematical diagram using Cartesian coordinates
     *  to display values for typically two variables for a set of data.
     * @constructs ScatterChart
     * @extends ChartBase
     * @mixes axisTypeMixer
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
            options: options,
            hasAxes: true
        });
    },

    /**
     * Add components
     * @override
     */
    addComponents: function() {
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
                    name: 'scatterSeries'
                }
            ],
            plot: true
        });
    },

    /**
     * Get scale option.
     * @returns {{xAxis: {valueType: string}, yAxis: {valueType: string}}}
     * @override
     */
    getScaleOption: function() {
        return {
            xAxis: {
                valueType: 'x'
            },
            yAxis: {
                valueType: 'y'
            }
        };
    }
});

tui.util.extend(ScatterChart.prototype, axisTypeMixer);

module.exports = ScatterChart;
