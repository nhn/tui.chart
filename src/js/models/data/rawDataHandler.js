/**
 * @fileoverview Raw data handler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var arrayUtil = require('../../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

/**
 * Raw data Handler.
 * @module rawDataHandler
 * @private */
var rawDataHandler = {
    /**
     * Pick stacks.
     * @param {Array.<{stack: string}>} seriesData - raw series data
     * @param {boolean} [divergingOption] - diverging option
     * @returns {Array.<string>} stacks
     */
    pickStacks: function(seriesData, divergingOption) {
        var stacks, uniqStacks, filteredStack;

        stacks = snippet.map(seriesData, function(seriesDatum) {
            return seriesDatum.stack;
        });

        uniqStacks = arrayUtil.unique(stacks);

        if (divergingOption) {
            uniqStacks = uniqStacks.slice(0, 2);
        }

        filteredStack = snippet.filter(uniqStacks, function(stack) {
            return !!stack;
        });

        if (filteredStack.length < uniqStacks.length) {
            filteredStack.push(chartConst.DEFAULT_STACK);
        }

        return filteredStack;
    },

    /**
     * Sort series data from stacks.
     * @param {Array.<{stack: ?string}>} seriesData series data
     * @param {Array.<string>} stacks stacks
     * @returns {Array}
     * @private
     */
    _sortSeriesData: function(seriesData, stacks) {
        var newSeriesData = [];

        if (!stacks) {
            stacks = this.pickStacks(seriesData);
        }

        snippet.forEachArray(stacks, function(stack) {
            var filtered = snippet.filter(seriesData, function(datum) {
                return (datum.stack || chartConst.DEFAULT_STACK) === stack;
            });
            newSeriesData = newSeriesData.concat(filtered);
        });

        return newSeriesData;
    },

    /**
     * Remove stack of series data.
     * @param {Array.<{stack: ?string}>} seriesData series data
     */
    removeSeriesStack: function(seriesData) {
        snippet.forEachArray(seriesData, function(datum) {
            delete datum.stack;
        });
    },

    /**
     * Find char type from chart name.
     * @param {object.<string, string>} seriesAlias - alias map
     * @param {string} seriesType - series name
     * @returns {*}
     */
    findChartType: function(seriesAlias, seriesType) {
        var chartType;

        if (seriesAlias) {
            chartType = seriesAlias[seriesType];
        }

        return chartType || seriesType;
    },

    /**
     * Get chart type map.
     * @param {{series: (Array | object)}} rawData - raw data
     * @returns {object.<string, string>}
     */
    getChartTypeMap: function(rawData) {
        var self = this;
        var chartTypeMap = {};

        if (snippet.isObject(rawData.series)) {
            snippet.forEach(rawData.series, function(data, seriesType) {
                chartTypeMap[self.findChartType(rawData.seriesAlias, seriesType)] = true;
            });
        }

        return chartTypeMap;
    },

    /**
     * Create minus values.
     * @param {Array.<number>} data number data
     * @returns {Array} minus values
     * @private
     */
    _createMinusValues: function(data) {
        return snippet.map(data, function(value) {
            return value < 0 ? 0 : -value;
        });
    },

    /**
     * Create plus values.
     * @param {Array.<number>} data number data
     * @returns {Array} plus values
     * @private
     */
    _createPlusValues: function(data) {
        return snippet.map(data, function(value) {
            return value < 0 ? 0 : value;
        });
    },

    /**
     * Make normal diverging raw series data.
     * @param {{data: Array.<number>}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeNormalDivergingRawSeriesData: function(rawSeriesData) {
        rawSeriesData.length = Math.min(rawSeriesData.length, 2);

        rawSeriesData[0].data = this._createMinusValues(rawSeriesData[0].data);

        if (rawSeriesData[1]) {
            rawSeriesData[1].data = this._createPlusValues(rawSeriesData[1].data);
        }

        return rawSeriesData;
    },

    /**
     * Make raw series data for stacked diverging option.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForStackedDiverging: function(rawSeriesData) {
        var self = this;
        var stacks = this.pickStacks(rawSeriesData, true);
        var result = [];
        var leftStack = stacks[0];
        var rightStack = stacks[1];

        rawSeriesData = this._sortSeriesData(rawSeriesData, stacks);

        snippet.forEachArray(rawSeriesData, function(seriesDatum) {
            var stack = seriesDatum.stack || chartConst.DEFAULT_STACK;
            if (stack === leftStack) {
                seriesDatum.data = self._createMinusValues(seriesDatum.data);
                result.push(seriesDatum);
            } else if (stack === rightStack) {
                seriesDatum.data = self._createPlusValues(seriesDatum.data);
                result.push(seriesDatum);
            }
        });

        return result;
    },

    /**
     * Make raw series data for diverging.
     * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
     * @param {?string} stackTypeOption stackType option
     * @returns {{data: Array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForDiverging: function(rawSeriesData, stackTypeOption) {
        if (predicate.isValidStackOption(stackTypeOption)) {
            rawSeriesData = this._makeRawSeriesDataForStackedDiverging(rawSeriesData);
        } else {
            rawSeriesData = this._makeNormalDivergingRawSeriesData(rawSeriesData);
        }

        return rawSeriesData;
    },

    /**
     * Update raw series data by options.
     * @param {object} rawData - raw data
     * @param {{stackType: ?string, diverging: ?boolean}} seriesOptions - series options
     */
    updateRawSeriesDataByOptions: function(rawData, seriesOptions) {
        var self = this;

        seriesOptions = seriesOptions || {};

        if (predicate.isValidStackOption(seriesOptions.stackType)) {
            snippet.forEach(rawData.series, function(seriesDatum, seriesType) {
                rawData.series[seriesType] = self._sortSeriesData(rawData.series[seriesType]);
            });
        }

        if (seriesOptions.diverging) {
            snippet.forEach(rawData.series, function(seriesDatum, seriesType) {
                rawData.series[seriesType] = self._makeRawSeriesDataForDiverging(seriesDatum, seriesOptions.stackType);
            });
        }
    },

    /**
     * Append outlier value to boxplot series data end
     * @param {object} rawData - raw data
     */
    appendOutliersToSeriesData: function(rawData) {
        var boxplot = rawData.series.boxplot;
        snippet.forEach(boxplot, function(seriesItem) {
            var outliers = seriesItem.outliers;

            if (outliers && outliers.length) {
                snippet.forEach(outliers, function(outlier) {
                    seriesItem.data[outlier[0]].push(outlier[1]);
                });
            }
        });
    },

    /**
     * Filter raw data belong to checked legend.
     * @param {object} rawData raw data
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @returns {object} rawData
     */
    filterCheckedRawData: function(rawData, checkedLegends) {
        var cloneData = JSON.parse(JSON.stringify(rawData));
        var filteredCategories;

        if (checkedLegends) {
            snippet.forEach(cloneData.series, function(serieses, chartType) {
                if (!checkedLegends[chartType]) {
                    cloneData.series[chartType] = [];
                } else if (checkedLegends[chartType].length) {
                    cloneData.series[chartType] = snippet.filter(serieses, function(series, index) {
                        return checkedLegends[chartType][index];
                    });
                }
            });
        }

        if (cloneData.series.bullet) {
            filteredCategories = [];
            snippet.forEach(checkedLegends.bullet, function(isChecked, index) {
                if (isChecked) {
                    filteredCategories.push(rawData.categories[index]);
                }
            });
            cloneData.categories = filteredCategories;
        }

        return cloneData;
    },

    /**
     * Modify rawData to fit chart format
     * @param {object} rawData - raw data
     * @private
     */
    _makeRawSeriesDataForBulletChart: function(rawData) {
        var bullet = rawData.series.bullet;

        rawData.categories = rawData.categories || [];

        rawData.categories = snippet.map(bullet, function(seriesData) {
            return seriesData.name || '';
        });
    }
};

module.exports = rawDataHandler;
