/**
 * @fileoverview This model is parent chart model.
 *               This model provides a method to convert the data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    aps = Array.prototype.slice,
    ChartModel;

ChartModel = ne.util.defineClass({
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options user options
     */
    init: function(data, options) {
        this.options = options || {};
        if (data) {
            this.setData(data);
        }
    },

    /**
     * Please implement the setData.
     */
    setData: function() {
      throw new Error('Please implement the setData.');
    },

    /**
     * Pick colors.
     * @param {number} count color count
     * @returns {array}
     */
    pickColors: function(count) {
        var colors;
        if (this.options && this.options.colors) {
            colors = this.options.colors;
        } else {
            colors = aps.call(chartConst.DEFAUlT_COLORS);
        }

        if (count && count > 0) {
            colors.length = count;
        }
        return colors;
    },

    /**
     * Pick axis data from user data.
     * Axis data is pairs of label and value​.
     * @param {object} data user data
     * @return {object} axis data;
     */
    pickAxisData: function(data) {
        var titleArr = data[0],
            axisData = aps.call(data);

        axisData.shift();

        if (this.hasStyleOption(titleArr)) {
            axisData = ne.util.map(axisData, function(items) {
                items = aps.call(items);
                items.length = items.length - 1;
                return items;
            });
        }

        return axisData;
    },

    /**
     * Pick labels from axis data.
     * @param {object} axisData axis data
     * @returns {array}
     */
    pickLabels: function(axisData) {
        var arr = ne.util.map(axisData, function(items) {
            return items[0];
        });
        return arr;
    },

    /**
     * Pick values from axis data.
     * @param {object} axisData axis data
     * @returns {array}
     */
    pickValues: function(axisData) {
        var arr2d = ne.util.map(axisData, function(items) {
            var values = aps.call(items);
            values.shift();
            return values;
        });
        return arr2d;
    },

    /**
     * Has style option?
     * @param {array} arr labels
     * @returns {boolean}
     */
    hasStyleOption: function(arr) {
        var last = arr[arr.length-1];
        return ne.util.isObject(last);
    },

    /**
     * Pick legend labels.
     * @param {array} arr labels
     * @returns {Object}
     */
    pickLegendLabels: function(arr) {
        var hasOption = this.hasStyleOption(arr),
            last = hasOption ? arr.length - 1 : -1,
            arr = ne.util.filter(arr, function(label, index) {
                return index !== 0 && index !== last;
            });
        return arr;
    }
});

module.exports = ChartModel;
