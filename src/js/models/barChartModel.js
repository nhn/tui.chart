/**
 * @fileoverview This model is about bar chart for management of bar chart data.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    AxisChartModel = require('./axisChartModel.js');

var BarChartModel = ne.util.defineClass(AxisChartModel, /** @lends BarChartModel.prototype */ {
    /**
     * This model is about bar chart for management of bar chart data.
     * @constructs BarChartModel
     * @extends AxisChartModel
     * @param {array.<array>} data user chart data
     * @param {{
     *   chart: {
     *     width: number,
     *     height: number,
     *     title: string,
     *     format: string
     *   },
     *   vAxis: {
     *     title: string,
     *     min: number
     *   },
     *   hAxis: {
     *     title: string,
     *     min: number
     *   },
     *   tooltip: {
     *     suffix: string,
     *     template: string
     *   },
     *   theme: string
     * }} options chart options
     */
    init: function(data, options) {
        options = options || {};
        /**
         * Bar chart type (column or bar)
         * @type {string}
         */
        this.barType = options.barType || chartConst.BAR_TYPE_BAR;

        /**
         * Whether vertical or not
         * @type {boolean}
         */
        this.isVertical = options.barType === chartConst.BAR_TYPE_COLUMN;

        AxisChartModel.call(this, data, options);
    }
});

module.exports = BarChartModel;
