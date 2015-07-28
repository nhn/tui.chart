/**
 * @fileoverview This model is bar chart model for management of bar chart data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    AxisChartModel = require('./axisChartModel.js');

var BarChartModel = ne.util.defineClass(AxisChartModel, {
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};
        /**
         * Bar chart type
         * vertical or horizontal
         * @type {string}
         */
        this.barType = options.barType || chartConst.BAR_TYPE_BAR;

        /**
         * Is vertical chart?
         * @type {boolean}
         */
        this.isVertical = options.barType === chartConst.BAR_TYPE_COLUMN;

        AxisChartModel.call(this, data, options);
    }
});

module.exports = BarChartModel;
