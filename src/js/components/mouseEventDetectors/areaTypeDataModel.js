/**
 * @fileoverview AreaTypeDataModel is data model for mouse event detector of area type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../../helpers/predicate');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var concat = Array.prototype.concat;

var AreaTypeDataModel = snippet.defineClass(/** @lends AreaTypeDataModel.prototype */ {
    /**
     * AreaTypeDataModel is data mode for mouse event detector of area type.
     * @constructs AreaTypeDataModel
     * @private
     * @param {Array} seriesItemBoundsData - series item bounds data
     */
    init: function(seriesItemBoundsData) {
        this.data = this._makeData(seriesItemBoundsData);

        /**
         * last group index
         * @type {number}
         */
        this.lastGroupIndex = 0;
    },

    /**
     * Make data for detecting mouse event.
     * @param {Array} seriesItemBoundsData - series item bounds data
     * @returns {Array}
     * @private
     */
    _makeData: function(seriesItemBoundsData) {
        var lastGroupIndex = 0;
        var seriesItemBoundsLength = seriesItemBoundsData.length;
        var data = snippet.map(seriesItemBoundsData, function(seriesDatum, seriesIndex) {
            var groupPositions = seriesDatum.data.groupPositions || seriesDatum.data.groupBounds;
            var chartType = seriesDatum.chartType;

            if (predicate.isLineTypeChart(chartType) || predicate.isRadialChart(chartType)) {
                groupPositions = arrayUtil.pivot(groupPositions);
            }

            lastGroupIndex = Math.max(groupPositions.length - 1, lastGroupIndex);

            return snippet.map(groupPositions, function(positions, groupIndex) {
                return snippet.map(positions, function(position, index) {
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

                    // Add legendIndex to datum on making multi series chart data, especially for LineScatterComboChart.
                    if (seriesItemBoundsLength > 1) {
                        datum.indexes.legendIndex = seriesIndex;
                    }

                    return datum;
                });
            });
        });

        data = concat.apply([], data);
        this.lastGroupIndex = lastGroupIndex;

        return snippet.filter(concat.apply([], data), function(datum) {
            return !!datum;
        });
    },

    /**
     * Find Data by layer position.
     * @param {{x: number, y: number}} layerPosition - layer position
     * @param {number} [distanceLimit] distance limitation to find data
     * @param {?number} selectLegendIndex select legend sereis index
     * @returns {object}
     */
    findData: function(layerPosition, distanceLimit, selectLegendIndex) {
        var min = 100000;
        var findFoundMap = {};
        var findFound;

        distanceLimit = distanceLimit || Number.MAX_VALUE;
        snippet.forEach(this.data, function(datum) {
            var xDiff = layerPosition.x - datum.bound.left;
            var yDiff = layerPosition.y - datum.bound.top;
            var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

            if (distance < distanceLimit && distance <= min) {
                min = distance;
                findFound = datum;
                findFoundMap[datum.indexes.index] = datum;
            }
        });

        if (!snippet.isNull(selectLegendIndex) && findFoundMap[selectLegendIndex]) {
            findFound = findFoundMap[selectLegendIndex];
        }

        return findFound;
    },

    /**
     * Find data by indexes.
     * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
     * @returns {object}
     */
    findDataByIndexes: function(indexes) {
        var foundData = null;

        snippet.forEachArray(this.data, function(datum) {
            if (datum.indexes.groupIndex === indexes.index && datum.indexes.index === indexes.seriesIndex) {
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
        var indexes = {
            index: 0,
            seriesIndex: index
        };

        return this.findDataByIndexes(indexes);
    },

    /**
     * Get last data.
     * @param {number} index - index
     * @returns {object}
     */
    getLastData: function(index) {
        var indexes = {
            index: this.lastGroupIndex,
            seriesIndex: index
        };

        return this.findDataByIndexes(indexes);
    }
});

module.exports = AreaTypeDataModel;
