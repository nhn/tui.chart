/**
 * @fileoverview Map chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    MapChartMapModel = require('./mapChartMapModel'),
    renderUtil = require('../helpers/renderUtil');

var MapChartSeries = tui.util.defineClass(Series, /** @lends MapChartSeries.prototype */ {
    /**
     * Map chart series component.
     * @constructs MapChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     *      @param {MapChartDataProcessor} params.dataProcessor data processor for map chart
     */
    init: function(params) {
        /**
         * Base position.
         * @type {{left: number, top: number}}
         */
        this.basePosition = {
            left: 0,
            top: 0
        };

        /**
         * Map model.
         * @type {MapChartMapModel}
         */
        this.mapModel = new MapChartMapModel(params.dataProcessor);

        Series.call(this, params);
    },

    /**
     * Make series data.
     * @returns {{colorModel: MapChartColorModel, map: Array.<object>, valueMap: object}} series data of map chart
     * @private
     */
    _makeSeriesData: function() {
        return {
            colorModel: this.data.colorModel,
            map: this.data.map,
            valueMap: this.dataProcessor.getValueMap()
        };
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @param {{colorModel: MapChartColorModel, map: Array.<object>, valueMap: object}} seriesData series data of map chart
     * @private
     * @override
     */
    _renderGraph: function(dimension, seriesData) {
        var params = this._makeParamsForGraphRendering(dimension, seriesData);

        params.mapDimension = this.mapModel.getMapDimension();
        this.graphRenderer.render(this.seriesContainer, params);
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(data) {
        this.mapModel.createMapData(data.map);
        return Series.prototype.render.call(this, data);
    },

    /**
     * Render series label.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(seriesLabelContainer) {
        var html = tui.util.map(this.mapModel.getLabelData(), function(datum, index) {
            var label = datum.name || datum.code,
                left = datum.labelPosition.left - (renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2),
                top = datum.labelPosition.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);
            return this._makeSeriesLabelHtml({
                left: left,
                top: top
            }, datum.name, 0, index);
        }, this).join('');
        seriesLabelContainer.innerHTML = html;
    },

    /**
     * On click series.
     */
    onClickSeries: function() {
        delete this.throttled;
    },

    /**
     * On move series.
     * @param {{left: number, top: number}} position position
     */
    onMoveSeries: function(position) {
        this._executeGraphRenderer(position, 'moveMouseOnSeries');
    },

    /**
     * On drag start series.
     * @param {{left: number, top: number}} position position
     */
    onDragStartSeries: function(position) {
        var that = this;
        this.startPosition = {
            left: position.left - this.basePosition.left,
            top: position.top - this.basePosition.top
        };
        this.throttled = tui.util.throttle(function(movePosition) {
            that.graphRenderer.moveMap(movePosition);
            that.basePosition = {
                left: -movePosition.left,
                top: -movePosition.top
            };
        }, 100);
    },

    /**
     * On drag series.
     * @param {{left: number, top: number}} position position
     */
    onDragSeries: function(position) {
        var movePosition = {
            left: this.startPosition.left - position.left,
            top: this.startPosition.top - position.top
        };

        this.throttled(movePosition);
    },

    /**
     * On drag end series.
     */
    onDragEndSeries: function() {
        delete this.throttled;
    },

    /**
     * Animate component.
     */
    animateComponent: function() {
        this.animateShowingAboutSeriesLabelArea();
    }
});

tui.util.CustomEvents.mixin(MapChartSeries);

module.exports = MapChartSeries;
