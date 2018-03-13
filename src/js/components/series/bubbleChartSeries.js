/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var Series = require('./series');
var CoordinateTypeSeriesBase = require('./coordinateTypeSeriesBase');
var snippet = require('tui-code-snippet');

var BubbleChartSeries = snippet.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs BubbleChartSeries
     * @private
     * @extends Series
     */
    init: function() {
        /**
         * previous clicked index.
         * @type {?number}
         */
        this.prevClickedIndex = null;

        /**
         * max radius for rendering circle graph
         * @type {null|number}
         */
        this.maxRadius = null;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;

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
            dimension = this.layout.dimension;
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
        var dimension = this.layout.dimension;
        var position = this.layout.position;
        var left = snippet.isExisty(ratioMap.x) ? (ratioMap.x * dimension.width) : positionByStep;
        var top = snippet.isExisty(ratioMap.y) ? (ratioMap.y * dimension.height) : positionByStep;

        return {
            left: position.left + left,
            top: position.top + dimension.height - top,
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
        var maxRadius = this.maxRadius;
        var step = this._calculateStep();
        var start = step ? step / 2 : 0;

        return seriesDataModel.map(function(seriesGroup, index) {
            var positionByStep = start + (step * index);

            return seriesGroup.map(function(seriesItem) {
                var hasRationMap = (seriesItem && seriesItem.ratioMap);

                return hasRationMap ? self._makeBound(seriesItem.ratioMap, positionByStep, maxRadius) : null;
            });
        });
    },

    /**
     * Set data for rendering.
     * @param {{
     *      paper: ?object,
     *      limit: {
     *          min: number,
     *          max: number
     *      },
     *      aligned: boolean,
     *      layout: {
     *          dimension: {width: number, height: number},
     *          position: {left: number, top: number}
     *      },
     *      dimensionMap: object,
     *      positionMap: object,
     *      axisDataMap: object,
     *      maxRadius: number
     * }} data - data for rendering
     * @private
     */
    _setDataForRendering: function(data) {
        this.maxRadius = data.maxRadius;
        Series.prototype._setDataForRendering.call(this, data);
    }
});

CoordinateTypeSeriesBase.mixin(BubbleChartSeries);

function bubbleSeriesFactory(params) {
    var libType = params.chartOptions.libType;
    var chartTheme = params.chartTheme;

    params.libType = libType;
    params.chartType = 'bubble';
    params.chartBackground = chartTheme.chart.background;

    return new BubbleChartSeries(params);
}

bubbleSeriesFactory.componentType = 'series';
bubbleSeriesFactory.BubbleChartSeries = BubbleChartSeries;

module.exports = bubbleSeriesFactory;
