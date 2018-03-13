/**
 * @fileoverview  Spectrum Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var pluginFactory = require('../../factories/pluginFactory');
var snippet = require('tui-code-snippet');

var SpectrumLegend = snippet.defineClass(/** @lends SpectrumLegend.prototype */ {
    /**
     * Spectrum Legend component.
     * @constructs SpectrumLegend
     * @private
     * @param {object} params parameters
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.options legend options
     *      @param {MapChartDataProcessor} params.dataProcessor data processor
     */
    init: function(params) {
        var libType = params.libType;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * color spectrum
         * @type {ColorSpectrum}
         */
        this.colorSpectrum = params.colorSpectrum;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, 'mapLegend');

        /**
         * Whether horizontal legend or not.
         * @type {boolean}
         */
        this.isHorizontal = predicate.isHorizontalLegend(this.options.align);

        /**
         * scale data for legend
         * @type {null|object}
         */
        this.scaleData = null;

        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;

        this._attachToEventBus();
    },

    /**
     * Attach to event bus.
     * @private
     */
    _attachToEventBus: function() {
        this.eventBus.on({
            showWedge: this.onShowWedge,
            hideTooltip: this.onHideWedge
        }, this);
        this.eventBus.on('beforeImageDownload', snippet.bind(this._removeLocationURLFromFillAttribute, this));
        this.eventBus.on('afterImageDownload', snippet.bind(this._restoreLocationURLToFillAttribute, this));
    },

    /**
     * Remove location URL from fill attribute
     * @private
     */
    _removeLocationURLFromFillAttribute: function() {
        this.graphRenderer.removeLocationURLFromFillAttribute();
    },

    /**
     * Restore location URL to fill attribute
     * @private
     */
    _restoreLocationURLToFillAttribute: function() {
        this.graphRenderer.restoreLocationURLToFillAttribute();
    },

    /**
     * Make base data to make tick html.
     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
     * @private
     */
    _makeBaseDataToMakeTickArea: function() {
        var dimension = this.layout.dimension;
        var scaleData = this.scaleData;
        var stepCount = scaleData.stepCount || scaleData.tickCount - 1;
        var baseData = {};

        baseData.position = this.layout.position;

        if (this.isHorizontal) {
            baseData.step = dimension.width / stepCount;
            baseData.position.top += chartConst.MAP_LEGEND_GRAPH_SIZE + chartConst.MAP_LEGEND_LABEL_PADDING;
        } else {
            baseData.step = dimension.height / stepCount;
            baseData.position.left += chartConst.MAP_LEGEND_GRAPH_SIZE + chartConst.MAP_LEGEND_LABEL_PADDING;
        }

        return baseData;
    },

    /**
     * Render tick area.
     * @param {Array.<object>} legendSet legend set
     * @private
     */
    _renderTickArea: function(legendSet) {
        if (this.options.reversed) {
            this.scaleData.labels.sort(function(prev, next) {
                return next - prev;
            });
        }
        this.graphRenderer.renderTicksAndLabels(this.paper, this._makeBaseDataToMakeTickArea(),
            this.scaleData.labels, this.isHorizontal, legendSet);
    },

    /**
     * Make graph dimension of vertical legend
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeVerticalGraphDimension: function() {
        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE,
            height: this.layout.dimension.height
        };
    },

    /**
     * Make graph dimension of horizontal legend
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalGraphDimension: function() {
        return {
            width: this.layout.dimension.width + 10,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE
        };
    },

    /**
     * Render graph.
     * @param {Array.<object>} legendSet legend set
     * @private
     */
    _renderGraph: function(legendSet) {
        var dimension, startForSwap;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalGraphDimension();
        } else {
            dimension = this._makeVerticalGraphDimension();
        }

        if (this.options.reversed) {
            startForSwap = this.colorSpectrum.start;
            this.colorSpectrum.start = this.colorSpectrum.end;
            this.colorSpectrum.end = startForSwap;
        }

        this.graphRenderer.render(this.paper, {
            dimension: dimension,
            position: this.layout.position
        }, this.colorSpectrum, this.isHorizontal, legendSet);
    },

    /**
     * Render legend area.
     * @returns {Array.<object>}
     * @private
     */
    _renderLegendArea: function() {
        var legendSet = this.paper.set();

        this._renderGraph(legendSet);
        this._renderTickArea(legendSet);

        return legendSet;
    },

    /**
     * Set data for rendering.
     * @param {{
     *      layout: object,
     *      legendScaleData: object
     * }} data - scale data
     * @private
     */
    _setDataForRendering: function(data) {
        this.layout = data.layout;
        this.paper = data.paper;
        this.scaleData = data.legendScaleData;
    },

    /**
     * Render legend component.
     * @param {object} data - scale data
     */
    render: function(data) {
        this._setDataForRendering(data);
        this.legnedSet = this._renderLegendArea();
    },

    /**
     * Rerender legend component.
     * @param {object} data - scale data
     */
    rerender: function(data) {
        this.legnedSet.remove();
        this.render(data);
    },

    /**
     * Resize legend component.
     * @param {object} data - scale data
     */
    resize: function(data) {
        this.rerender(data);
    },

    /**
     * On show wedge.
     * @param {number} ratio ratio
     */
    onShowWedge: function(ratio) {
        ratio = this.options.reversed ? 1 - ratio : ratio;
        this.graphRenderer.showWedge(chartConst.MAP_LEGEND_SIZE * ratio);
    },

    /**
     * On hide wedge.
     */
    onHideWedge: function() {
        this.graphRenderer.hideWedge();
    }
});

/**
 * Factory for SpectrumLegend
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
function spectrumLegendFactory(params) {
    var isLegendVisible = snippet.isUndefined(params.options.visible) ? true : params.options.visible;
    var chartType = params.chartOptions.chartType;
    var spectrumLegend = null;

    if (isLegendVisible) {
        params.chartType = chartType;

        spectrumLegend = new SpectrumLegend(params);
    }

    return spectrumLegend;
}

spectrumLegendFactory.componentType = 'legend';
spectrumLegendFactory.SpectrumLegend = SpectrumLegend;

module.exports = spectrumLegendFactory;
