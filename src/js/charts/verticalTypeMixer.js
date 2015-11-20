/**
 * @fileoverview verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisDataMaker = require('../helpers/axisDataMaker'),
    state = require('../helpers/state');

/**
 * verticalTypeMixer is mixer of vertical type chart(column, line, area).
 * @mixin
 */
var verticalTypeMixer = {
    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var aligned = state.isLineTypeChart(options.chartType),
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels,
                aligned: aligned,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeValueAxisData({
                values: convertedData.values,
                seriesDimension: bounds.series.dimension,
                stacked: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: convertedData.formatFunctions,
                options: options.yAxis,
                isVertical: true,
                aligned: aligned
            });

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = verticalTypeMixer;
