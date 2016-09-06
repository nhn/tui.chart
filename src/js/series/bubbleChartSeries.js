/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');

var BubbleChartSeries = tui.util.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs BubbleChartSeries
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
     * Calculate step value for label axis.
     * @returns {number}
     * @private
     */
    _calculateStep: function() {
        var step = 0;
        var dimension, size, len;
        var hasVerticalCategory = this.dataProcessor.isXCountGreaterThanYCount(this.chartType);

        if (this.dataProcessor.hasCategories(hasVerticalCategory)) {
            dimension = this.boundsMaker.getDimension('series');
            len = this.dataProcessor.getCategoryCount(hasVerticalCategory);

            if (hasVerticalCategory) {
                size = dimension.height;
            } else {
                size = dimension.width;
            }

            step = size / len;
        }

        return step;
    },

    /**
     * Make bound for bubble chart.
     * @param {{x: number, y: number, r: number}} ratioMap - ratio map
     * @param {number} positionByStep - position value by step
     * @param {number} maxRadius - max radius
     * @returns {{left: number, top: number, radius: number}}
     * @private
     */
    _makeBound: function(ratioMap, positionByStep, maxRadius) {
        var dimension = this.boundsMaker.getDimension('series');
        var left = tui.util.isExisty(ratioMap.x) ? (ratioMap.x * dimension.width) : positionByStep;
        var top = tui.util.isExisty(ratioMap.y) ? (ratioMap.y * dimension.height) : positionByStep;

        return {
            left: left,
            top: dimension.height - top,
            radius: Math.max(maxRadius * ratioMap.r, 2)
        };
    },

    /**
     * Make bounds for bubble chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var maxRadius = this.boundsMaker.getMaxRadiusForBubbleChart();
        var step = this._calculateStep();
        var start = step ? step / 2 : 0;

        return seriesDataModel.map(function(seriesGroup, index) {
            var positionByStep = start + (step * index);

            return seriesGroup.map(function(seriesItem) {
                var hasRationMap = (seriesItem && seriesItem.ratioMap);

                return hasRationMap ? self._makeBound(seriesItem.ratioMap, positionByStep, maxRadius) : null;
            });
        });
    }
});

CoordinateTypeSeriesBase.mixin(BubbleChartSeries);
tui.util.CustomEvents.mixin(BubbleChartSeries);

module.exports = BubbleChartSeries;
