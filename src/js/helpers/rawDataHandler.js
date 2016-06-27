/**
 * @fileoverview Raw data handler.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Raw data Handler.
 * @module rawDataHandler
 */
var rawDataHandler = {
    /**
     * Pick stacks.
     * @param {Array.<{stack: string}>} seriesData - raw series data
     * @param {boolean} [divergingOption] - diverging option
     * @returns {Array.<string>} stacks
     */
    pickStacks: function(seriesData, divergingOption) {
        var stacks, uniqStacks, filteredStack;

        stacks = tui.util.map(seriesData, function(seriesDatum) {
            return seriesDatum.stack;
        });

        uniqStacks = tui.util.unique(stacks);

        if (divergingOption) {
            uniqStacks = uniqStacks.slice(0, 2);
        }

        filteredStack = tui.util.filter(uniqStacks, function(stack) {
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
     */
    sortSeriesData: function(seriesData, stacks) {
        var newSeriesData = [];

        tui.util.forEachArray(stacks, function(stack) {
            var filtered = tui.util.filter(seriesData, function(datum) {
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
        tui.util.forEachArray(seriesData, function(datum) {
            delete datum.stack;
        });
    },

    /**
     * Find char type from chart name.
     * @param {object.<string, string>} seriesAlias - alias map
     * @param {string} seriesName - series name
     * @returns {*}
     */
    findChartType: function(seriesAlias, seriesName) {
        var chartType;

        if (seriesAlias) {
            chartType = seriesAlias[seriesName];
        }

        return chartType || seriesName;
    },

    /**
     * Get chart type map.
     * @param {{series: (Array | object)}} rawData - raw data
     * @returns {object.<string, string>}
     */
    getChartTypeMap: function(rawData) {
        var self = this;
        var chartTypeMap = {};

        if (tui.util.isObject(rawData.series)) {
            tui.util.forEach(rawData.series, function(data, seriesName) {
                chartTypeMap[self.findChartType(rawData.seriesAlias, seriesName)] = true;
            });
        }

        return chartTypeMap;
    }
};

module.exports = rawDataHandler;
