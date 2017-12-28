/**
 * @fileoverview Series component for rendering graph of heatmap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var labelHelper = require('./renderingLabelHelper');
var snippet = require('tui-code-snippet');

var HeatmapChartSeries = snippet.defineClass(Series, /** @lends HeatmapChartSeries.prototype */ {
    /**
     * Series component for rendering graph of heatmap chart.
     * @constructs HeatmapChartSeries
     * @private
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
     * Make series data for rendering graph and sending to mouse event detector.
     * @returns {{
     *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
     *      seriesDataModel: SeriesDataModel
     * }} series data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var groupBounds = this._makeBounds();
        var seriesDataModel = this._getSeriesDataModel();

        return {
            colorSpectrum: this.colorSpectrum,
            groupBounds: groupBounds,
            seriesDataModel: seriesDataModel,
            isAvailable: function() {
                return groupBounds && groupBounds.length > 0;
            }
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
        var left = (blockWidth * x) + this.layout.position.left;
        var top = height - (blockHeight * (y + 1)) + this.layout.position.top;

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
     * Call showWedge event of spectrum legend, when call showTooltip event.
     * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
     */
    onShowTooltip: function(params) {
        var seriesDataModel = this._getSeriesDataModel();
        var indexes = params.indexes;
        var ratio = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index).ratio;

        this.eventBus.fire('showWedge', ratio);
    },

    /**
     * Render series label.
     * @param {object} paper - paper
     * @returns {Array.<object>}
     * @private
     */
    _renderSeriesLabel: function(paper) {
        var sdm = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet = labelHelper.boundsToLabelPositions(sdm, boundsSet, labelTheme);
        var labels = sdm.map(function(datum) {
            return datum.valuesMap.value;
        });

        return this.graphRenderer.renderSeriesLabel(paper, positionsSet, labels, labelTheme, selectedIndex);
    },

    /**
     * Resize.
     * @override
     */
    resize: function() {
        this.boundMap = null;

        Series.prototype.resize.apply(this, arguments);
    },

    /**
     * Make exportation data for public event of series type.
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

function heatmapChartSeriesFactory(params) {
    var libType = params.chartOptions.libType;

    params.libType = libType;
    params.chartType = 'heatmap';

    return new HeatmapChartSeries(params);
}

heatmapChartSeriesFactory.componentType = 'series';
heatmapChartSeriesFactory.HeatmapChartSeries = HeatmapChartSeries;

module.exports = heatmapChartSeriesFactory;
