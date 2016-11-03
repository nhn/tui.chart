/**
 * @fileoverview AreaTypeDataModel is data model for custom event of area type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../../helpers/predicate');

var concat = Array.prototype.concat;

var AREA_THRESHHOLD = 50;

var AreaTypeDataModel = tui.util.defineClass(/** @lends AreaTypeDataModel.prototype */ {
    /**
     * AreaTypeDataModel is data mode for custom event of area type.
     * @constructs AreaTypeDataModel
     * @param {object} seriesItemBoundsData - series item bounds data
     */
    init: function(seriesItemBoundsData) {
        this.data = this._makeData(seriesItemBoundsData);
    },

    /**
     * Make data for detecting mouse event.
     * @param {Array} seriesItemBoundsData - series item bounds data
     * @returns {Array}
     * @private
     */
    _makeData: function(seriesItemBoundsData) {
        var data = tui.util.map(seriesItemBoundsData, function(seriesDatum) {
            var groupPositions = seriesDatum.data.groupPositions || seriesDatum.data.groupBounds;
            var chartType = seriesDatum.chartType;

            if (predicate.isLineTypeChart(chartType)) {
                groupPositions = tui.util.pivot(groupPositions);
            }

            return tui.util.map(groupPositions, function(positions, groupIndex) {
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
        });

        data = concat.apply([], data);

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
        var min = 100000;
        var foundData;

        tui.util.forEach(this.data, function(datum) {
            var xDiff = layerPosition.x - datum.bound.left;
            var yDiff = layerPosition.y - datum.bound.top;
            var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

            if (distance < AREA_THRESHHOLD && distance < min) {
                min = distance;
                foundData = datum;
            }
        });

        return foundData;
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
