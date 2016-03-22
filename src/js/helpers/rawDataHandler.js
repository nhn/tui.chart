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
     * @param {Array.<{stack: string}>} seriesData raw series data
     * @returns {Array.<string>} stacks
     */
    pickStacks: function(seriesData) {
        var stacks;

        stacks = tui.util.map(seriesData, function(seriesDatum) {
            return seriesDatum.stack;
        });

        stacks = tui.util.filter(stacks, function(stack) {
            return !!stack;
        });

        stacks = tui.util.unique(stacks).slice(0, 2);

        stacks.push(chartConst.DEFAULT_STACK);

        return stacks;
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
    }
};

module.exports = rawDataHandler;
