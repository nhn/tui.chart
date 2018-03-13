/**
 * @fileoverview BoundsBaseCoordinateModel is data model for mouse event detector of bounds type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * position
 * @typedef {{left: number, top: number}} position
 * @private
 */

/**
 * bound
 * @typedef {{
 *      dimension: {width: number, height: number},
 *      position: position
 *}} bound
 * @private
 */

/**
 * group bound
 *  @typedef {Array.<Array.<bound>>} groupBound
 * @private
 */

/**
 * group position
 *  @typedef {Array.<Array.<position>>} groupPosition
 * @private
 */

/**
 * series info
 * @typedef {{
 *      chartType: {string},
 *      data: {
 *          groupBounds: ?groupBound,
 *          groupValues: ?Array.<Array.<number>>,
 *          groupPositions: ?groupPosition
 *      }
 *}} seriesInfo
 * @private
 */

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var BoundsBaseCoordinateModel = snippet.defineClass(/** @lends BoundsBaseCoordinateModel.prototype */ {
    /**
     * BoundsBaseCoordinateModel is data mode for mouse event detector of bounds type.
     * @constructs BoundsBaseCoordinateModel
     * @private
     * @param {Array} seriesItemBoundsData - series item bounds data
     */
    init: function(seriesItemBoundsData) {
        this.data = this._makeData(seriesItemBoundsData);
    },

    /**
     * @param {string} chartType - chart type
     * @param {object} indexes - index of SeriesDataModel
     * @param {boolean} allowNegativeTooltip - whether allow negative tooltip or not
     * @param {object} bound - coordinate data for rendering graph
     * @returns {object} - `sendData`: tooltip contents, `bound`: for detecting hovered or not
     * @private
     */
    _makeTooltipData: function(chartType, indexes, allowNegativeTooltip, bound) {
        return {
            sendData: {
                chartType: chartType,
                indexes: indexes,
                allowNegativeTooltip: allowNegativeTooltip,
                bound: bound
            },
            bound: {
                left: bound.left,
                top: bound.top,
                right: bound.left + bound.width,
                bottom: bound.top + bound.height
            }
        };
    },

    /**
     * Make position data for rect type graph
     * @param {groupBound} groupBounds group bounds
     * @param {string} chartType chart type
     * @returns {Array}
     * @private
     */
    _makeRectTypePositionData: function(groupBounds, chartType) {
        var allowNegativeTooltip = !predicate.isBoxTypeChart(chartType);

        return snippet.map(groupBounds, function(bounds, groupIndex) {
            return snippet.map(bounds, function(bound, index) {
                if (!bound) {
                    return null;
                }

                return this._makeTooltipData(
                    chartType,
                    {
                        groupIndex: groupIndex,
                        index: index
                    },
                    allowNegativeTooltip,
                    bound.end || bound
                );
            }, this);
        }, this);
    },

    /**
     * Make position data for rect type graph
     * @param {groupBound} groupBounds group bounds
     * @param {string} chartType chart type
     * @param {object} resultData resultData
     * @private
     */
    _makeOutliersPositionDataForBoxplot: function(groupBounds, chartType, resultData) {
        var allowNegativeTooltip = !predicate.isBoxTypeChart(chartType);
        var _groupBounds = [].concat(groupBounds);

        snippet.forEach(_groupBounds, function(bounds, groupIndex) {
            snippet.forEach(bounds, function(bound, index) {
                var outliers;

                if (bound.outliers && bound.outliers.length) {
                    outliers = snippet.map(bound.outliers, function(outlier, outlierIndex) {
                        var outlierBound = {
                            top: outlier.top - 3,
                            left: outlier.left - 3,
                            width: 6,
                            height: 6
                        };

                        return this._makeTooltipData(
                            chartType,
                            {
                                groupIndex: groupIndex,
                                index: index,
                                outlierIndex: outlierIndex
                            },
                            allowNegativeTooltip,
                            outlierBound
                        );
                    }, this);

                    resultData[groupIndex] = resultData[groupIndex].concat(outliers);
                }
            }, this);
        }, this);
    },

    /**
     * Make position data for dot type graph
     * @param {groupPositions} groupPositions group positions
     * @param {string} chartType chart type
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makeDotTypePositionData: function(groupPositions, chartType) {
        if (!groupPositions) {
            return [];
        }

        return snippet.map(arrayUtil.pivot(groupPositions), function(positions, groupIndex) {
            return snippet.map(positions, function(position, index) {
                if (!position) {
                    return null;
                }

                return {
                    sendData: {
                        chartType: chartType,
                        indexes: {
                            groupIndex: groupIndex,
                            index: index
                        },
                        bound: position
                    },
                    bound: {
                        left: position.left - chartConst.DOT_RADIUS,
                        top: position.top - chartConst.DOT_RADIUS,
                        right: position.left + chartConst.DOT_RADIUS,
                        bottom: position.top + chartConst.DOT_RADIUS
                    }
                };
            });
        });
    },

    /**
     * Join data.
     * @param {Array.<Array.<Array.<object>>>} dataGroupSet data group set
     * @returns {Array.<Array.<object>>} joined data
     * @private
     */
    _joinData: function(dataGroupSet) {
        var results = [];
        snippet.forEachArray(dataGroupSet, function(dataGroup) {
            snippet.forEachArray(dataGroup, function(data, index) {
                var additionalIndex;

                if (!results[index]) {
                    results[index] = data;
                } else {
                    additionalIndex = results[index].length;
                    snippet.forEachArray(data, function(datum) {
                        if (datum) {
                            datum.sendData.indexes.legendIndex = datum.sendData.indexes.index + additionalIndex;
                        }
                    });
                    results[index] = results[index].concat(data);
                }
            });
        });

        return results;
    },

    /**
     * Make data for detecting mouse event.
     * @param {Array} seriesItemBoundsData - series item bounds data
     * @returns {Array.<Array.<object>>} coordinate data
     * @private
     */
    _makeData: function(seriesItemBoundsData) {
        var data = snippet.map(seriesItemBoundsData, function(info) {
            var result;

            if (predicate.isLineTypeChart(info.chartType)) {
                result = this._makeDotTypePositionData(info.data.groupPositions, info.chartType);
            } else {
                result = this._makeRectTypePositionData(info.data.groupBounds, info.chartType);
            }

            if (predicate.isBoxplotChart(info.chartType)) {
                this._makeOutliersPositionDataForBoxplot(info.data.groupBounds, info.chartType, result);
            }

            return result;
        }, this);

        return this._joinData(data);
    },

    /**
     * Find candidates.
     * @param {{bound: {left: number, top: number, right: number, bottom: number}}} data data
     * @param {number} layerX layerX
     * @param {number} layerY layerY
     * @returns {Array.<{sendData: object}>} candidates
     * @private
     */
    _findCandidates: function(data, layerX, layerY) {
        return snippet.filter(data, function(datum) {
            var bound = datum && datum.bound,
                included = false,
                includedX, includedY;

            if (bound) {
                includedX = bound.left <= layerX && bound.right >= layerX;
                includedY = bound.top <= layerY && bound.bottom >= layerY;
                included = includedX && includedY;
            }

            return included;
        });
    },

    /**
     * Find data.
     * @param {number} groupIndex group index
     * @param {number} layerX mouse position x
     * @param {number} layerY mouse position y
     * @returns {object} tooltip data
     */
    findData: function(groupIndex, layerX, layerY) {
        var min = 10000;
        var result = null;
        var candidates;

        if (groupIndex > -1 && this.data[groupIndex]) {
            // extract data containing layerX, layerY
            candidates = this._findCandidates(this.data[groupIndex], layerX, layerY);

            // find nearest data to top position among extracted data
            snippet.forEachArray(candidates, function(data) {
                var diff = Math.abs(layerY - data.bound.top);

                if (min > diff) {
                    min = diff;
                    result = data.sendData;
                }
            });
        }

        return result;
    },

    /**
     * Find data by indexes.
     * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
     * @param {number} [indexes.outlierIndex] - index of outlier of boxplot series, it only exists in boxplot chart
     * @returns {object} tooltip data
     */
    findDataByIndexes: function(indexes) {
        var foundData = this.data[indexes.index][indexes.seriesIndex].sendData;

        if (snippet.isNumber(indexes.outlierIndex)) {
            return this._findOutlierDataByIndexes(indexes);
        }

        return foundData;
    },

    /**
     * find plot chart data by indexes
     * @param {{
     *  index: {number},
     *  seriesIndex: {number},
     *  outlierIndex: {number}
     * }} indexes - indexe of series item displaying a tooltip
     * @returns {object} - outlier tooltip data
     */
    _findOutlierDataByIndexes: function(indexes) {
        var foundData = null;

        snippet.forEachArray(this.data[indexes.index], function(datum) {
            var datumIndexes = datum.sendData.indexes;
            var found = (datumIndexes.index === indexes.seriesIndex) &&
                (datumIndexes.outlierIndex === indexes.outlierIndex);

            if (found) {
                foundData = datum.sendData;
            }

            return !found;
        });

        return foundData;
    }
});

module.exports = BoundsBaseCoordinateModel;
