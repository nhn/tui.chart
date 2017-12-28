/**
 * @fileoverview Scatter chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');
var chartConst = require('../../const');
var snippet = require('tui-code-snippet');

var ScatterChartSeries = snippet.defineClass(Series, /** @lends ScatterChartSeries.prototype */ {
    /**
     * Scatter chart series component.
     * @constructs ScatterChartSeries
     * @private
     * @extends Series
     */
    init: function() {
        /**
         * previous clicked index.
         * @type {?number}
         */
        this.prevClickedIndex = null;
        Series.apply(this, arguments);
    },

    /**
     * Make bound for scatter chart.
     * @param {{x: number, y: number, r: number}} ratioMap - ratio map
     * @returns {{left: number, top: number, raius: number}}
     * @private
     */
    _makeBound: function(ratioMap) {
        var dimension = this.layout.dimension;
        var basePosition = this.layout.position;

        return {
            left: basePosition.left + (ratioMap.x * dimension.width),
            top: dimension.height - (ratioMap.y * dimension.height) + basePosition.top,
            radius: chartConst.SCATTER_RADIUS
        };
    },

    /**
     * Make bounds for scatter chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var hasRatioMap = (seriesItem && seriesItem.ratioMap);

                return hasRatioMap ? self._makeBound(seriesItem.ratioMap) : null;
            });
        });
    }
});

CoordinateTypeSeriesBase.mixin(ScatterChartSeries);

function scatterSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'scatter';
    params.chartBackground = chartTheme.chart.background;

    return new ScatterChartSeries(params);
}

scatterSeriesFactory.componentType = 'series';
scatterSeriesFactory.ScatterChartSeries = ScatterChartSeries;

module.exports = scatterSeriesFactory;
