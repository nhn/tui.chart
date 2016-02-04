/**
 * @fileoverview  Legend component for map chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    pluginFactory = require('../factories/pluginFactory'),
    legendTemplate = require('./../legends/legendTemplate');

var MapChartLegend = tui.util.defineClass(/** @lends MapChartLegend.prototype */ {
    /**
     * Legend component for map chart.
     * @constructs MapChartLegend
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
        var maxValue = Math.max.apply(null, this.dataProcessor.getValues()),
            formatFunctions = this.dataProcessor.getFormatFunctions(),
            valueStr = renderUtil.formatValue(maxValue, formatFunctions),
            labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label),
            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width:  chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,
            height: chartConst.MAP_LEGEND_SIZE
        };
    },

    /**
     * Make horizontal legend dimension
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalDimension: function() {
        var maxValue = Math.max.apply(null, this.dataProcessor.getValues()),
            labelHeight = renderUtil.getRenderedLabelHeight(maxValue, this.theme.label),
            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width:  chartConst.MAP_LEGEND_SIZE,
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
    },

    /**
     * Make base data to make tick html.
     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
     * @private
     */
    _makeBaseDataToMakeTickHtml: function() {
        var dimension = this.boundsMaker.getDimension('legend'),
            stepCount = this.axesData.tickCount - 1,
            baseData = {};

        if (this.isHorizontal) {
            baseData.startPositionValue = 5;
            baseData.step = dimension.width / stepCount;
            baseData.positionType = 'left:';
        } else {
            baseData.startPositionValue = 0;
            baseData.step = dimension.height / stepCount;
            baseData.positionType = 'top:';
            baseData.labelSize = parseInt(renderUtil.getRenderedLabelHeight(this.axesData.labels[0], this.theme.label) / 2, 10) - 1;
        }

        return baseData;
    },
    /**
     * Make tick html.
     * @returns {string} tick html.
     * @private
     */
    _makeTickHtml: function() {
        var baseData = this._makeBaseDataToMakeTickHtml(),
            positionValue = baseData.startPositionValue,
            htmls;

        htmls = tui.util.map(this.axesData.labels, function(label) {
            var labelSize, html;

            if (this.isHorizontal) {
                labelSize = parseInt(renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2, 10);
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
        }, this);

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
        }
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
        }
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

        this.graphRenderer.render(container, dimension, this.colorModel, this.isHorizontal);
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
     * @param {{colorModel: MapChartColorModel, axesData: object}} data rendering data
     * @returns {HTMLElement} legend element
     */
    render: function(data) {
        var container = dom.create('DIV', this.className);

        this.legendContainer = container;
        this.colorModel = data.colorModel;
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

tui.util.CustomEvents.mixin(MapChartLegend);

module.exports = MapChartLegend;
