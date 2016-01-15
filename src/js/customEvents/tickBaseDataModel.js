/**
 * @fileoverview TickBaseDataModel is tick base data model.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');

var TickBaseDataModel = tui.util.defineClass(/** @lends TickBaseDataModel.prototype */ {
    /**
     * TickBaseDataModel is tick base data model.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolan} isVertical whether vertical or not
     * @constructs TickBaseDataModel
     */
    init: function(dimension, tickCount, chartType, isVertical) {
        this.data = this._makeData(dimension, tickCount, chartType, isVertical);
    },

    /**
     * Make tick base data about line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @returns {Array} tick base data
     * @private
     */
    _makeLineTypeData: function(width, tickCount) {
        var tickInterval = (width + 1) / (tickCount - 1),
            halfInterval = tickInterval / 2,
            ranges = tui.util.map(tui.util.range(0, tickCount), function(index) {
                return {
                    min: index * tickInterval - halfInterval,
                    max: index * tickInterval + halfInterval
                };
            });
        ranges[tickCount - 1].max -= 1;
        return ranges;
    },

    /**
     * Make tick base data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @returns {Array} tick base data
     * @private
     */
    _makeNormalData: function(size, tickCount) {
        var len = tickCount - 1,
            tickInterval = size / len,
            prev = 0;
        return tui.util.map(tui.util.range(0, len), function(index) {
            var max = tui.util.min([size, (index + 1) * tickInterval]),
                limit = {
                    min: prev,
                    max: max
                };
            prev = max;
            return limit;
        });
    },

    /**
     * Make tick base data for custom event.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolan} isVertical whether vertical or not
     * @returns {Array.<object>} tick base data
     * @private
     */
    _makeData: function(dimension, tickCount, chartType, isVertical) {
        var sizeType = isVertical ? 'width' : 'height',
            data;
        if (predicate.isLineTypeChart(chartType)) {
            data = this._makeLineTypeData(dimension[sizeType], tickCount);
        } else {
            data = this._makeNormalData(dimension[sizeType], tickCount);
        }

        return data;
    },

    /**
     * Find index.
     * @param {number} pointValue mouse position point value
     * @returns {number} group index
     */
    findIndex: function(pointValue) {
        var foundIndex = -1;
        tui.util.forEachArray(this.data, function(limit, index) {
            if (limit.min < pointValue && limit.max >= pointValue) {
                foundIndex = index;
                return false;
            }
        });

        return foundIndex;
    },

    /**
     * Get tick base data length.
     * @returns {number} length
     */
    getLength: function() {
        return this.data.length;
    },

    /**
     * Make range of tooltip position.
     * @param {number} index index
     * @param {string} chartType chart type
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    makeRange: function(index, chartType) {
        var limit = this.data[index],
            range, center;
        if (predicate.isLineTypeChart(chartType)) {
            center = parseInt(limit.max - (limit.max - limit.min) / 2, 10);
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: limit.min,
                end: limit.max
            };
        }

        return range;
    }
});

module.exports = TickBaseDataModel;
