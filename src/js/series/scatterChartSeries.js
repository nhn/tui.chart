/**
 * @fileoverview Scatter chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');
var chartConst = require('../const');

var ScatterChartSeries = tui.util.defineClass(Series, /** @lends ScatterChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs ScatterChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bound for bubble chart.
     * @param {{x: number, y: number, r: number}} ratioMap - ratio map
     * @returns {{left: number, top: number, raius: number}}
     * @private
     */
    _makeBound: function(ratioMap) {
        var dimension = this.boundsMaker.getDimension('series');

        return {
            left: ratioMap.x * dimension.width,
            top: dimension.height - (ratioMap.y * dimension.height),
            radius: chartConst.SCATTER_RADIUS
        };
    },

    /**
     * Make bounds for bubble chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var hasRatioMap = (seriesItem && seriesItem.ratioMap);

                return hasRatioMap ? self._makeBound(seriesItem.ratioMap) : null;
            });
        });
    }
});

CoordinateTypeSeriesBase.mixin(ScatterChartSeries);
tui.util.CustomEvents.mixin(ScatterChartSeries);

module.exports = ScatterChartSeries;
