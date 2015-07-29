/**
 * @fileoverview This model is line chart model for management of line chart data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var AxisChartModel = require('./axisChartModel.js');

var LineChartModel = ne.util.defineClass(AxisChartModel, {
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};

        /**
         * Is vertical chart?
         * @type {boolean}
         */
        this.isVertical = true;
        AxisChartModel.call(this, data, options);
    },

    /**
     * Set series
     * @param {[array]} values chart values
     * @param {{min: number, max: number}} scale axis scale
     * @param {array} lastItemStyles last item styles
     * @param {object} options options
     * @private
     */
    _setSeries: function(values, scale, lastItemStyles, isVertical, options) {
        values = this.pivotArray(values);
        AxisChartModel.prototype._setSeries.call(this, values, scale, lastItemStyles, isVertical, options);
    }
});

module.exports = LineChartModel;
