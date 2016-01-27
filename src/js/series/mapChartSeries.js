/**
 * @fileoverview Map chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');

var MapChartSeries = tui.util.defineClass(Series, /** @lends MapChartSeries.prototype */ {
    /**
     * Map chart series component.
     * @constructs MapChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
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

        this.graphRenderer.render(this.seriesContainer, params);
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
        this.graphRenderer.moveMouseOnSeries(position);
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
    }
});

tui.util.CustomEvents.mixin(MapChartSeries);

module.exports = MapChartSeries;
