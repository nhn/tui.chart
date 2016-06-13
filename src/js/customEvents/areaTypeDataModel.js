/**
 * @fileoverview AreaTypeDataModel is data model for custom event of area type.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

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
     * Make area type data for custom event.
     * @param {Array.<Array.<object>>} groupPositions - group positions
     * @param {string} chartType - chart type
     * @returns {Array}
     * @private
     */
    _makeData: function(groupPositions, chartType) {
        groupPositions = tui.util.pivot(groupPositions);
        return tui.util.map(groupPositions, function(positions, groupIndex) {
            return tui.util.map(positions, function(position, index) {
                return {
                    chartType: chartType,
                    indexes: {
                        groupIndex: groupIndex,
                        index: index
                    },
                    bound: position
                };
            });
        });
    },

    /**
     * Find Data.
     * @param {number} groupIndex - group index
     * @param {number} layerY - mouse position
     * @returns {object}
     */
    findData: function(groupIndex, layerY) {
        var result = null,
            min = 10000;
        tui.util.forEach(this.data[groupIndex], function(data) {
            var diff = Math.abs(layerY - data.bound.top);
            if (min > diff) {
                min = diff;
                result = data;
            }
        });
        return result;
    },

    /**
     * Get first data.
     * @param {number} index - index
     * @returns {object}
     */
    getFirstData: function(index) {
        return this.data[0][index];
    },

    /**
     * Get last data.
     * @param {number} index - index
     * @returns {object}
     */
    getLastData: function(index) {
        var lastGroupIndex = this.data.length - 1;

        return this.data[lastGroupIndex][index];
    }
});

module.exports = AreaTypeDataModel;
