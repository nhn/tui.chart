/**
 * @fileoverview ChartModel is parent of all chart model.
 *               This model provides a method to convert the data.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js'),
    Model = require('./model.js');

/**
 * @classdesc ChartModel is parent of all chart model.
 * @class
 * @augments Model
 */
var ChartModel = ne.util.defineClass(Model, {
    /**
     * Chart title
     * @type {string}
     */
    title: '',

    /**
     * Chart area percentage
     * @type {string}
     */
    chartArea: '50%',
    /**
     * Constructor
     * @param {object} data user chart data
     * @param {object} options user options
     */
    init: function(data, options) {
        options = options || {};

        this.options = options;

        this._setTitle(options.title || this.title);
        this._setTitleFontSize(options.titleFontSize || chartConst.DEFAULT_TITLE_FONT_SIZE);
        this._setChartArea(options.chartArea || this.chartArea);

        if (data) {
            this._setData(data);
        }
    },

    /**
     * Please implement the setData.
     * @private
     */
    _setData: function() {
      throw new Error('Please implement the setData.');
    },

    /**
     * Set title.
     * @param {string} title
     * @private
     */
    _setTitle: function(title) {
        this.title = title;
    },

    /**
     * Set title font size
     * @param {number} fontSize
     * @private
     */
    _setTitleFontSize: function(fontSize) {
        this.titleFontSize = fontSize;
    },

    /**
     * set chartArea.
     * @param {string} chartArea
     * @private
     */
    _setChartArea: function(chartArea) {
        this.chartArea = chartArea;
    },

    /**
     * Pick colors.
     * @param {number} count color count
     * @returns {array}
     * @private
     */
    _pickColors: function(count) {
        var colors;
        if (this.options && this.options.colors) {
            colors = this.options.colors;
        } else {
            colors = chartConst.DEFAUlT_COLORS.slice();
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
     * @private
     */
    _pickAxisData: function(data) {
        var titles = data[0],
            axisData = data.slice();

        axisData.shift();

        if (this._hasStyleOption(titles)) {
            axisData = ne.util.map(axisData, function(items) {
                items = items.slice();
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
     * @private
     */
    _pickLabels: function(axisData) {
        var labels = ne.util.map(axisData, function(items) {
            return items[0];
        });
        return labels;
    },

    /**
     * Pick values from axis data.
     * @param {object} axisData axis data
     * @returns {array}
     * @private
     */
    _pickValues: function(axisData) {
        var result = ne.util.map(axisData, function(items) {
            var values = items.slice();
            values.shift();
            return values;
        });
        return result;
    },

    /**
     * Get styles from cssText
     * @param {string} cssText cssText ex)color:red, border-color:blue
     * @returns {object}
     * @private
     */
    _getStyles: function(cssText) {
        var cssTexts = cssText.split(','),
            styles = {};
        ne.util.forEachArray(cssTexts, function(item) {
            var selectors = item.split(':');
            styles[selectors[0]] = selectors[1];
        });
        return styles;
    },

    /**
     * Pick last item styles.
     * @param {object} data axis data
     * @returns {array}
     * @private
     */
    _pickLastItemStyles: function(data) {
        var titles = data[0],
            styles = [],
            axisData;

        if (this._hasStyleOption(titles)) {
            axisData = data.slice();
            axisData.shift();
            styles = ne.util.map(axisData, function(items) {
                var style = items[items.length - 1];
                return this._getStyles(style);
            }, this);
        }

        return styles;
    },

    /**
     * Has style option?
     * @param {array} arr labels
     * @returns {boolean}
     * @private
     */
    _hasStyleOption: function(arr) {
        var last = arr[arr.length-1];
        return ne.util.isObject(last) && last.role === 'style';
    },

    /**
     * Pick legend labels.
     * @param {array} arr labels
     * @returns {Object}
     * @private
     */
    _pickLegendLabels: function(arr) {
        var hasOption = this._hasStyleOption(arr),
            last = hasOption ? arr.length - 1 : -1,
            arr = ne.util.filter(arr, function(label, index) {
                return index !== 0 && index !== last;
            });
        return arr;
    }
});

module.exports = ChartModel;
