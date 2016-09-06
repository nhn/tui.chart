/**
 * @fileoverview  Spectrum Legend component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var pluginFactory = require('../factories/pluginFactory');
var legendTemplate = require('./../legends/legendTemplate');

var SpectrumLegend = tui.util.defineClass(/** @lends SpectrumLegend.prototype */ {
    /**
     * Spectrum Legend component.
     * @constructs SpectrumLegend
     * @param {object} params parameters
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.options legend options
     *      @param {MapChartDataProcessor} params.dataProcessor data processor
     *      @param {BoundsMaker} params.boundsMaker bounds maker
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
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

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
    },

    /**
     * Make vertical legend dimension.
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeVerticalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues());
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var valueStr = renderUtil.formatValue(maxValue, formatFunctions, this.chartType, 'legend');
        var labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label);
        var padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,
            height: chartConst.MAP_LEGEND_SIZE
        };
    },

    /**
     * Make horizontal legend dimension
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues()),
            labelHeight = renderUtil.getRenderedLabelHeight(maxValue, this.theme.label),
            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_SIZE,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE + labelHeight + padding
        };
    },

    /**
     * Register dimension.
     */
    registerDimension: function() {
        var dimension;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalDimension();
        } else {
            dimension = this._makeVerticalDimension();
        }

        this.boundsMaker.registerBaseDimension('legend', dimension);
        this.boundsMaker.registerBaseDimension('calculationLegend', dimension);
    },

    /**
     * Make base data to make tick html.
     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
     * @private
     */
    _makeBaseDataToMakeTickHtml: function() {
        var dimension = this.boundsMaker.getDimension('legend');
        var stepCount = this.axesData.tickCount - 1;
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
            firstLabel = this.axesData.labels[0];
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

        htmls = tui.util.map(this.axesData.labels, function(label) {
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
            height: this.boundsMaker.getDimension('legend').height
        };
    },

    /**
     * Make graph dimension of horizontal legend
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalGraphDimension: function() {
        return {
            width: this.boundsMaker.getDimension('legend').width + 10,
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
        renderUtil.renderPosition(container, this.boundsMaker.getPosition('legend'));
        this._renderGraph(container);
        tickContainer = this._renderTickArea();
        container.appendChild(tickContainer);
        container.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Render legend component.
     * @param {{colorSpectrum: ColorSpectrum, axesData: object}} data rendering data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;
        this.colorSpectrum = data.colorSpectrum;
        this.axesData = data.axesData;
        this._renderLegendArea(container);

        return container;
    },

    /**
     * Resize legend component.
     */
    resize: function() {
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

tui.util.CustomEvents.mixin(SpectrumLegend);

module.exports = SpectrumLegend;
