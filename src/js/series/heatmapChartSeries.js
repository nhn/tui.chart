/**
 * @fileoverview Heatmap chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');

var HeatmapChartSeries = tui.util.defineClass(Series, /** @lends HeatmapChartSeries.prototype */ {
    /**
     * Heatmap chart series component.
     * @constructs HeatmapChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);
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
        var boundsSet = this._makeBounds();

        return {
            colorModel: this.data.colorModel,
            groupBounds: boundsSet,
            seriesDataModel: this.dataProcessor.getSeriesDataModel(this.seriesName)
        };
    },

    /**
     * Make bounds for Heatmap chart.
     * @param {number} blockWidth - block width
     * @param {number} blockHeight - block height
     * @param {number} x - x index
     * @param {number} y - y index
     * @returns {{end: {left: number, top: number, width: number, height: number}}}
     * @private
     */
    _makeBound: function(blockWidth, blockHeight, x, y) {
        var height = this.boundsMaker.getDimension('series').height;
        var left = (blockWidth * x) + chartConst.SERIES_EXPAND_SIZE;
        var top = height - (blockHeight * (y + 1)) + chartConst.SERIES_EXPAND_SIZE;
        return {
            end: {
                left: left,
                top: top,
                width: blockWidth,
                height: blockHeight
            }
        };
    },

    /**
     * Make bounds for scatter chart.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.seriesName);
        var dimension = this.boundsMaker.getDimension('series');
        var blockWidth = dimension.width / this.dataProcessor.getCategoryCount(false);
        var blockHeight = dimension.height / this.dataProcessor.getCategoryCount(true);

        return seriesDataModel.map(function(seriesGroup, x) {
            return seriesGroup.map(function(seriesItem, y) {
                return self._makeBound(blockWidth, blockHeight, x, y);
            });
        });
    },

    /**
     * On show tooltip for calling showWedge.
     * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
     */
    onShowTooltip: function(params) {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(this.seriesName);
        var indexes = params.indexes;
        var ratio = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index).ratio;

        this.fire('showWedge', ratio);
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - series label container
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var sdm = this.dataProcessor.getSeriesDataModel(this.seriesName);
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet = labelHelper.boundsToLabelPositions(sdm, boundsSet, labelTheme);
        var html = labelHelper.makeLabelsHtmlForBoundType(labelContainer, sdm, positionsSet, labelTheme, selectedIndex);

        labelContainer.innerHTML = html;
    },

    /**
     * Animate component.
     * @param {boolean} [isRerendering] - whether rerendering or not
     */
    animateComponent: function(isRerendering) {
        this.animateShowingAboutSeriesLabelArea(isRerendering);
    }
});

tui.util.CustomEvents.mixin(HeatmapChartSeries);

module.exports = HeatmapChartSeries;
