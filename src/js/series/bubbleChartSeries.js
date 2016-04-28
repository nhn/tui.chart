/**
 * @fileoverview Bubble chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

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

            if (seriesDataModel.isXCountGreaterThanYCount()) {
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
     * @returns {{left: number, top: number, raius: number}}
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
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var maxRadius = this.boundsMaker.getMinimumPixelStepForAxis();
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
     * Make series data.
     * @returns {{
     *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            groupBounds: this._makeBounds(),
            seriesDataModel: this.dataProcessor.getSeriesDataModel(this.chartType)
        };
    },

    /**
     * Make series rendering position
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {number} value - value
     * @param {string} label - label
     * @param {?boolean} isStart - whether start or not
     * @returns {{left: number, top: number}} - rendering position
     * @private
     */
    _makeSeriesRenderingPosition: function(bound, labelHeight, value, label, isStart) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label),
            left = bound.left,
            top = bound.top + (bound.height - labelHeight + chartConst.TEXT_PADDING) / 2;

        if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * showTooltip is mouseover event callback on series graph.
     * @param {object} params parameters
     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {number} groupIndex group index
     * @param {number} index index
     * @param {{left: number, top: number}} mousePosition mouse position
     */
    showTooltip: function(params, bound, groupIndex, index, mousePosition) {
        this.fire('showTooltip', tui.util.extend({
            indexes: {
                groupIndex: groupIndex,
                index: index
            },
            mousePosition: mousePosition
        }, params));
    },

    /**
     * hideTooltip is mouseout event callback on series graph.
     * @param {string} id tooltip id
     */
    hideTooltip: function() {
        this.fire('hideTooltip');
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {object} seriesData series data
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var showTooltip = tui.util.bind(this.showTooltip, this, {
            chartType: this.chartType
        });
        var callbacks = {
            showTooltip: showTooltip,
            hideTooltip: tui.util.bind(this.hideTooltip, this)
        };
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        this.graphRenderer.render(this.seriesContainer, params, callbacks);
    },

    /**
     * Make html for label of series area.
     * @param {{left: number, top: number}} basePosition - position
     * @param {string} label - label of SeriesItem
     * @param {number} index - index
     * @returns {string}
     * @private
     */
    _makeSeriesLabelsHtml: function(basePosition, label, index) {
        var labelHeight = renderUtil.getRenderedLabelHeight(label, this.theme.label);
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);
        var position = {
            left: basePosition.left - (labelWidth / 2),
            top: basePosition.top - (labelHeight / 2)
        };

        return this._makeSeriesLabelHtml(position, label, index);
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - container for label area
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var self = this;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType);
        var html = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var bound = self.seriesData.groupBounds[groupIndex][index];

                return seriesItem ? self._makeSeriesLabelsHtml(bound, seriesItem.label, index) : '';
            }).join('');
        }).join('');

        labelContainer.innerHTML = html;
    },

    /**
     * On click series.
     * @param {{left: number, top: number}} position mouse position
     */
    onClickSeries: function(position) {
        this._executeGraphRenderer(position, 'clickSeries');
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position mouse position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    }
});

tui.util.CustomEvents.mixin(BubbleChartSeries);

module.exports = BubbleChartSeries;
