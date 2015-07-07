/**
 * @fileoverview chart model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    aps = Array.prototype.slice,
    ChartModel;

ChartModel = ne.util.defineClass({
    init: function(data, options) {
        this.options = options || {};
        if (data) {
            this.setData(data);
        }
    },

    setData: function() {
      throw new Error('Please implement the setData.');
    },

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
     * picked axis data from user initial data
     * axis data is pairs of label and value​
     * @param {object} data user initial data
     * @return {object} series data;
     */
    pickAxisData: function(data) {
        var titleArr = data[0],
            seriesData = aps.call(data);

        seriesData.shift();

        if (this.hasStyleOption(titleArr)) {
            seriesData = ne.util.map(seriesData, function(items) {
                items = aps.call(items);
                items.length = items.length - 1;
                return items;
            });
        }

        return seriesData;
    },

    /**
     * pick labels from axis data
     * @param {object} axisData
     * @returns {array}
     */
    pickLabels: function(axisData) {
        var arr = ne.util.map(axisData, function(items) {
            return items[0];
        });
        return arr;
    },

    /**
     * pick values from axis data
     * @param {object} axisData
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
     * has style option
     * @param {array} arr
     * @returns {boolean}
     */
    hasStyleOption: function(arr) {
        var lastItem = arr[arr.length-1];
        return ne.util.isObject(lastItem);
    },

    /**
     * pick legend labels
     * @param {array} titleArr
     * @returns {Object}
     */
    pickLegendLabels: function(titleArr) {
        var hasOption = this.hasStyleOption(titleArr),
            last = hasOption ? titleArr.length - 1 : -1,
            arr = ne.util.filter(titleArr, function(label, index) {
                return index !== 0 && index !== last;
            });
        return arr;
    }
});

module.exports = ChartModel;
