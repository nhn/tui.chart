/**
 * @fileoverview  Legend component for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    pluginFactory = require('../factories/pluginFactory'),
    legendTemplate = require('./../legends/legendTemplate');

var Legend = tui.util.defineClass(/** @lends Legend.prototype */ {
    /**
     * Legend component for map chart.
     * @constructs Legend
     * @param {object} params parameters
     *      @param {object} params.theme axis theme
     *      @param {?Array.<string>} params.chartTypes chart types
     *      @param {string} params.chart type
     */
    init: function(params) {
        var libType = params.libType || chartConst.DEFAULT_PLUGIN;

        this.className = 'tui-chart-legend-area';

        /**
         * legend theme
         * @type {Object}
         */
        this.theme = params.theme;

        /**
         * options
         * @type {params.options|{legendAlign}|{}}
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
    },

    /**
     * Register dimension.
     */
    registerDimension: function() {
        var maxValue = Math.max.apply(null, this.dataProcessor.getValues()),
            formatFunctions = this.dataProcessor.getFormatFunctions(),
            valueStr = renderUtil.formatValue(maxValue, formatFunctions),
            labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label),
            dimension = {
                width: 35 + labelWidth + 5,
                height: 200
            };

        this.boundsMaker.registerBaseDimension('legend', dimension);
    },

    /**
     * Make tick html.
     * @returns {string} tick html.
     * @private
     */
    _makeTickHtml: function() {
        var top = 0,
            labelHeight = parseInt(renderUtil.getRenderedLabelHeight(this.axesData.labels[0], this.theme.label) / 2, 10) - 1,
            step = this.boundsMaker.getDimension('legend').height / (this.axesData.tickCount - 1),
            htmls;

        htmls = tui.util.map(this.axesData.labels, function(label) {
            var html = legendTemplate.tplTick({
                top: top,
                labelTop: top - labelHeight,
                label: label
            });

            top += step;
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
        return tickContainer;
    },

    /**
     * Render legend area.
     * @param {HTMLElement} container legend container
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     * @param {Array.<boolean>} checkedIndexes checked indexes
     * @private
     */
    _renderLegendArea: function(container) {
        container.innerHTML = '';
        renderUtil.renderPosition(container, this.boundsMaker.getPosition('legend'));
        this.graphRenderer.render(container, {
            width: 20,
            height: this.boundsMaker.getDimension('legend').height
        }, this.colorModel);
        container.appendChild(this._renderTickArea());
        container.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);
    },

    /**
     * Render legend component.
     * @param {{colorModel: MapChartColorModel, axesData: object}} data rendering data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var el = dom.create('DIV', this.className);

        this.legendContainer = el;
        this.colorModel = data.colorModel;
        this.axesData = data.axesData;
        this._renderLegendArea(el);

        return el;
    },

    /**
     * Resize legend component.
     * @param {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound lengend bound
     */
    resize: function() {
        this._renderLegendArea(this.legendContainer);
    }
});

tui.util.CustomEvents.mixin(Legend);

module.exports = Legend;
