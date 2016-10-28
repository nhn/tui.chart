/**
 * @fileoverview AreaTypeDataModel is data model for custom event of area type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var concat = Array.prototype.concat;

var AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {
    /**
     * AreaTypeDataModel is data mode for custom event of area type.
     * @constructs AreaTypeDataModel
     * @param {object} seriesInfo series info
     */
    init: function(seriesInfo) {
        this.data = this._makeData(seriesInfo.data.groupPositions, seriesInfo.chartType);
    },

    /**
     * Make data for detecting mouse event.
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {string} chartType - chart type
     * @returns {Array}
     * @private
     */
    _makeData: function(groupPositions, chartType) {
        var data;

        groupPositions = tui.util.pivot(groupPositions);
        data = tui.util.map(groupPositions, function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                var datum = null;

                if (position) {
                    datum = {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        bound: position
                    };
                }

                return datum;
            });
        });

        return tui.util.filter(concat.apply([], data), function(datum) {
            return !!datum;
        });
    },

    /**
     * Find Data.
     * @param {{x: number, y: number}} layerPosition - layer position
     * @returns {object}
     */
    findData: function(layerPosition) {
        var result = null;
        var minX = 10000;
        var minY = 10000;
        var foundData = [];

        tui.util.forEach(this.data, function(datum) {
            var diff = Math.abs(layerPosition.x - datum.bound.left);
            if (minX > diff) {
                minX = diff;
                foundData = [datum];
            } else if (minX === diff) {
                foundData.push(datum);
            }
        });

        tui.util.forEach(foundData, function(datum) {
            var diff = Math.abs(layerPosition.y - datum.bound.top);
            if (minY > diff) {
                minY = diff;
                result = datum;
            }
        });

        return result;
    },

    /**
     * Find data by indexes.
     * @param {number} groupIndex - group index
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _findDataByIndexes: function(groupIndex, index) {
        var foundData = null;

        tui.util.forEachArray(this.data, function(datum) {
            if (datum.indexes.groupIndex === groupIndex && datum.indexes.index === index) {
                foundData = datum;
            }

            return !foundData;
        });

        return foundData;
    },

    /**
     * Get first data.
     * @param {number} index - index
     * @returns {object}
     */
    getFirstData: function(index) {
        return this._findDataByIndexes(0, index);
    },

    /**
     * Get last data.
     * @param {number} index - index
     * @returns {object}
     */
    getLastData: function(index) {
        var lastGroupIndex = this.data.length - 1;

        return this._findDataByIndexes(lastGroupIndex, index);
    }
});

module.exports = AreaTypeDataModel;
