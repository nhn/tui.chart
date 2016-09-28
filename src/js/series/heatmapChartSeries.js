/**
 * @fileoverview Series component for rendering graph of heatmap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');

var HeatmapChartSeries = tui.util.defineClass(Series, /** @lends HeatmapChartSeries.prototype */ {
    /**
     * Series component for rendering graph of heatmap chart.
     * @constructs HeatmapChartSeries
     * @param {object} params - parameters
     * @extends Series
     */
    init: function(params) {
        /**
         * Color spectrum
         * @type {ColorSpectrum}
         */
        this.colorSpectrum = params.colorSpectrum;

        Series.call(this, params);
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
            colorSpectrum: this.colorSpectrum,
            groupBounds: boundsSet,
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * Make bound for graph rendering.
     * @param {number} blockWidth - block width
     * @param {number} blockHeight - block height
     * @param {number} x - x index
     * @param {number} y - y index
     * @returns {{end: {left: number, top: number, width: number, height: number}}}
     * @private
     */
    _makeBound: function(blockWidth, blockHeight, x, y) {
        var height = this.layout.dimension.height;
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
     * Make bounds for graph rendering.
     * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
     * @private
     */
    _makeBounds: function() {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var dimension = this.layout.dimension;
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
        var seriesDataModel = this._getSeriesDataModel();
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
        var sdm = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet = labelHelper.boundsToLabelPositions(sdm, boundsSet, labelTheme);
        var html = labelHelper.makeLabelsHtmlForBoundType(sdm, positionsSet, labelTheme, selectedIndex);

        labelContainer.innerHTML = html;
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData - series data
     * @returns {{x: number, y: number}}
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        return {
            x: seriesData.indexes.groupIndex,
            y: seriesData.indexes.index
        };
    }
});

tui.util.CustomEvents.mixin(HeatmapChartSeries);

module.exports = HeatmapChartSeries;
