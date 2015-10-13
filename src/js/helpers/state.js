/**
 * @fileoverview chart state.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * state.
 * @module state
 */
var state = {
    /**
     * Whether line type chart or not.
     * @param {string} chartType chart type
     * @returns {boolean} result boolean
     */
    isLineTypeChart: function(chartType) {
        return chartType === chartConst.CHART_TYPE_LINE || chartType === chartConst.CHART_TYPE_AREA;
    }
};

module.exports = state;
