/**
 * @fileoverview  Spectrum Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var pluginFactory = require('../../factories/pluginFactory');
var legendTemplate = require('./legendTemplate');

var SpectrumLegend = tui.util.defineClass(/** @lends SpectrumLegend.prototype */ {
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
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * class name.
         * @type {string}
         */
        this.className = 'tui-chart-legend-area';

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
    },

    /**
     * Make base data to make tick html.
     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
     * @private
     */
    _makeBaseDataToMakeTickHtml: function() {
        var dimension = this.layout.dimension;
        var scaleData = this.scaleData;
        var stepCount = scaleData.stepCount || scaleData.tickCount - 1;
        var baseData = {};
        var firstLabel;

        if (this.isHorizontal) {
            baseData.startPositionValue = 5;
            baseData.step = dimension.width / stepCount;
            baseData.positionType = 'left:';
        } else {
            baseData.startPositionValue = 0;
            baseData.step = dimension.height / stepCount;
            baseData.positionType = 'top:';
            firstLabel = scaleData.labels[0];
            baseData.labelSize = parseInt(renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label) / 2, 10) - 1;
        }

        return baseData;
    },
    /**
     * Make tick html.
     * @returns {string} tick html.
     * @private
     */
    _makeTickHtml: function() {
        var self = this;
        var baseData = this._makeBaseDataToMakeTickHtml();
        var positionValue = baseData.startPositionValue;
        var htmls;

        htmls = tui.util.map(this.scaleData.labels, function(label) {
            var labelSize, html;

            if (self.isHorizontal) {
                labelSize = parseInt(renderUtil.getRenderedLabelWidth(label, self.theme.label) / 2, 10);
            } else {
                labelSize = baseData.labelSize;
            }

            html = legendTemplate.tplTick({
                position: baseData.positionType + positionValue + 'px',
                labelPosition: baseData.positionType + (positionValue - labelSize) + 'px',
                label: label
            });

            positionValue += baseData.step;

            return html;
        });

        return htmls.join('');
    },

    /**
     * Render tick area.
     * @returns {HTMLElement} tick countainer
     * @private
     */
    _renderTickArea: function() {
        var tickContainer = dom.create('div', 'tui-chart-legend-tick-area');

        tickContainer.innerHTML = this._makeTickHtml();

        if (this.isHorizontal) {
            dom.addClass(tickContainer, 'horizontal');
        }

        return tickContainer;
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
     * @param {HTMLElement} container container element
     * @private
     */
    _renderGraph: function(container) {
        var dimension;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalGraphDimension();
        } else {
            dimension = this._makeVerticalGraphDimension();
        }

        this.graphRenderer.render(container, dimension, this.colorSpectrum, this.isHorizontal);
    },

    /**
     * Render legend area.
     * @param {HTMLElement} container legend container
     * @private
     */
    _renderLegendArea: function(container) {
        var tickContainer;

        container.innerHTML = '';
        renderUtil.renderPosition(container, this.layout.position);
        this._renderGraph(container);
        tickContainer = this._renderTickArea();
        container.appendChild(tickContainer);
        container.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
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
        this.scaleData = data.legendScaleData;
    },

    /**
     * Render legend component.
     * @param {object} data - scale data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;
        this._setDataForRendering(data);
        this._renderLegendArea(container);

        return container;
    },

    /**
     * Resize legend component.
     * @param {object} data - scale data
     */
    resize: function(data) {
        this._setDataForRendering(data);
        this._renderLegendArea(this.legendContainer);
    },

    /**
     * On show wedge.
     * @param {number} ratio ratio
     */
    onShowWedge: function(ratio) {
        this.graphRenderer.showWedge(chartConst.MAP_LEGEND_SIZE * ratio);
    },

    /**
     * On hide wedge.
     */
    onHideWedge: function() {
        this.graphRenderer.hideWedge();
    }
});

function spectrumLegendFactory(params) {
    var isLegendVisible = tui.util.isUndefined(params.options.visible) ? true : params.options.visible;
    var chartType = params.chartOptions.chartType;

    if (isLegendVisible) {
        params.chartType = chartType;

        return new SpectrumLegend(params);
    }
}

spectrumLegendFactory.componentType = 'legend';

module.exports = spectrumLegendFactory;
