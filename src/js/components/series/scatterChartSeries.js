/**
 * @fileoverview Scatter chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');
var chartConst = require('../../const');

var ScatterChartSeries = tui.util.defineClass(Series, /** @lends ScatterChartSeries.prototype */ {
    /**
     * Scatter chart series component.
     * @constructs ScatterChartSeries
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

        return {
            left: ratioMap.x * dimension.width + chartConst.SERIES_EXPAND_SIZE,
            top: dimension.height - (ratioMap.y * dimension.height) + chartConst.SERIES_EXPAND_SIZE,
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

module.exports = ScatterChartSeries;
