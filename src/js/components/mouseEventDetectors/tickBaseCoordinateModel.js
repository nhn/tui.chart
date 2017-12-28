/**
 * @fileoverview TickBaseDataModel is tick base data model.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../../helpers/predicate');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var TickBaseDataModel = snippet.defineClass(/** @lends TickBaseDataModel.prototype */ {
    /**
     * TickBaseDataModel is tick base data model.
     * @param {{
     *     dimension: {
     *         width: number,
     *         height: number
     *     }, position: {
     *         left: number,
     *         top: number
     *     }
     * }} layout layout
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @param {boolean} isVertical whether vertical or not
     * @param {Array.<string>} [chartTypes] - chart types of combo chart
     * @constructs TickBaseDataModel
     * @private
     */
    init: function(layout, tickCount, chartType, isVertical, chartTypes) {
        /**
         * whether line type or not
         * @type {boolean}
         */
        this.isLineType = predicate.isLineTypeChart(chartType, chartTypes);

        this.data = this._makeData(layout, tickCount, isVertical);
    },

    /**
     * Get each tick ranges
     * @param {number} tickCount tick count
     * @param {number} firstPosition first position value
     * @param {number} tickInterval tick distance
     * @returns {Array.<object>}
     * @private
     */
    _getRanges: function(tickCount, firstPosition, tickInterval) {
        var prev = firstPosition;
        var halfInterval = tickInterval / 2;

        return snippet.map(snippet.range(0, tickCount), function() {
            var limit = {
                min: prev - halfInterval,
                max: prev + halfInterval
            };

            prev += tickInterval;

            return limit;
        });
    },

    /**
     * Make tick base data about line type chart.
     * @param {number} width width
     * @param {number} tickCount tick count
     * @param {number} firstPosition firstPosition of group
     * @returns {Array} tick base data
     * @private
     */
    _makeLineTypeData: function(width, tickCount, firstPosition) {
        var tickInterval = (width + 1) / (tickCount - 1);
        var ranges = this._getRanges(tickCount, (firstPosition || 0), tickInterval);

        ranges[tickCount - 1].max -= 1;

        return ranges;
    },

    /**
     * Make tick base data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @param {number} firstPosition firstPosition of group
     * @returns {Array} tick base data
     * @private
     */
    _makeNormalData: function(size, tickCount, firstPosition) {
        var len = tickCount - 1;
        var tickInterval = size / len;
        var prev = (firstPosition || 0);

        return snippet.map(snippet.range(0, len), function() {
            var max = arrayUtil.min([size + prev, tickInterval + prev]);
            var limit = {
                min: prev,
                max: max
            };
            prev = max;

            return limit;
        });
    },

    /**
     * Make tick base data for mouse event detector.
     * @param {{dimension: object, position: object}} layout layout
     * @param {number} tickCount tick count
     * @param {boolean} isVertical whether vertical or not
     * @returns {Array.<object>} tick base data
     * @private
     */
    _makeData: function(layout, tickCount, isVertical) {
        var sizeType = isVertical ? 'width' : 'height';
        var positionType = isVertical ? 'left' : 'top';
        var data;

        if (this.isLineType) {
            data = this._makeLineTypeData(layout.dimension[sizeType], tickCount, layout.position[positionType]);
        } else {
            data = this._makeNormalData(layout.dimension[sizeType], tickCount, layout.position[positionType]);
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

        snippet.forEachArray(this.data, function(limit, index) {
            if (limit.min < pointValue && limit.max >= pointValue) {
                foundIndex = index;

                return false;
            }

            return true;
        });

        return foundIndex;
    },

    /**
     * Get last index.
     * @returns {number}
     */
    getLastIndex: function() {
        return this.data.length - 1;
    },

    /**
     * Make range of tooltip position.
     * @param {number} index index
     * @param {number} positionValue positionValue
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    makeRange: function(index, positionValue) {
        var limit = this.data[index],
            range, center;
        if (this.isLineType) {
            center = parseInt(limit.max - ((limit.max - limit.min) / 2), 10);
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: limit.min - (positionValue || 0),
                end: limit.max - (positionValue || 0)
            };
        }

        return range;
    }
});

module.exports = TickBaseDataModel;
