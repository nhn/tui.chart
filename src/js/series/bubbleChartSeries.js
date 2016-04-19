/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const');

var BubbleChartSeries = tui.util.defineClass(Series, /** @lends BubbleChartSeries.prototype */ {
    /**
     * Bubble chart series component.
     * @constructs BubbleChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Calculate step value for label axis.
     * @returns {number}
     * @private
     */
    _calculateStep: function() {
        var step = 0;
        var dimension, seriesDataModel, size, len;

        if (this.dataProcessor.hasCategories()) {
            dimension = this.boundsMaker.getDimension('series');
            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
            len = this.dataProcessor.getCategories().length;

            if (seriesDataModel.isGreaterXCountThanYCount()) {
                size = dimension.width;
            } else {
                size = dimension.height;
            }

            step = size / len;
        }

        return step;
    },

    /**
     * Make position for bubble chart.
     * @param {number} positionByStep - position value by step
     * @param {SeriesItemForCoordinateType} seriesItem - SeriesItemForCoordinateType
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePosition: function(positionByStep, seriesItem) {
        var dimension = this.boundsMaker.getDimension('series');
        var ratioMap = seriesItem.ratioMap;
        var left = tui.util.isExisty(ratioMap.x) ? ratioMap.x * dimension.width : positionByStep;
        var top = tui.util.isExisty(ratioMap.y) ? ratioMap.y * dimension.height : positionByStep;
        var padding = chartConst.SERIES_EXPAND_SIZE;

        return {
            left: padding + left,
            top: padding + dimension.height - top
        };
    },

    /**
     * Make positions for bubble chart.
     * @returns {Array.<Array.<{left: number, top: number}>>} positions
     * @private
     */
    _makePositions: function() {
        var self = this;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var step = this._calculateStep();
        var start = step ? step / 2 : 0;

        return seriesDataModel.map(function(seriesGroup, index) {
            var positionByStep = start + (step * index);
            var makePosition = tui.util.bind(self._makePosition, self, positionByStep);

            return seriesGroup.map(makePosition);
        });
    },

    /**
     * Make series data.
     * @returns {{
     *      groupPositions: Array.<Array.<{left: number, top: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            groupPositions: this._makePositions(),
            seriesDataModel: this.dataProcessor.getSeriesDataModel(this.chartType)
        };
    }
});

module.exports = BubbleChartSeries;
