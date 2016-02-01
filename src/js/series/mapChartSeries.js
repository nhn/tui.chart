/**
 * @fileoverview Map chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    MapChartMapModel = require('./mapChartMapModel'),
    dom = require('../helpers/domHandler'),
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
         * Zoom magnification.
         * @type {number}
         */
        this.zoomMagn = 1;

        /**
         * Map ratio.
         * @type {number}
         */
        this.mapRatio = 1;

        /**
         * Graph dimension.
         * @type {{}}
         */
        this.graphDimension = {};

        /**
         * Limit position.
         * @type {{}}
         */
        this.limitPosition = {};

        /**
         * Map model.
         * @type {MapChartMapModel}
         */
        this.mapModel = new MapChartMapModel(params.dataProcessor);

        Series.call(this, params);
    },

    /**
     * Set map ratio.
     * @private
     */
    _setMapRatio: function() {
        var seriesDimension = this.boundsMaker.getDimension('series'),
            mapDimension = this.mapModel.getMapDimension(),
            widthRatio = seriesDimension.width / mapDimension.width,
            heightRatio = seriesDimension.height / mapDimension.height;

        this.mapRatio = Math.min(widthRatio, heightRatio);
    },

    /**
     * Render series component.
     * @param {object} data data for rendering
     * @returns {HTMLElement} series element
     */
    render: function(data) {
        var container;

        this.mapModel.createMapData(data.map);
        this._setMapRatio();

        container = Series.prototype.render.call(this, data);
        return container;
    },

    /**
     * Set graph dimension.
     * @private
     */
    _setGraphDimension: function() {
        var seriesDimension = this.boundsMaker.getDimension('series');

        this.graphDimension = {
            width: seriesDimension.width * this.zoomMagn,
            height: seriesDimension.height * this.zoomMagn
        };
    },

    /**
     * Set limit position to move map.
     * @private
     */
    _setLimitPositionToMoveMap: function() {
        var seriesDimension = this.boundsMaker.getDimension('series'),
            graphDimension = this.graphDimension;

        this.limitPosition = {
            left: seriesDimension.width - graphDimension.width,
            top: seriesDimension.height - graphDimension.height
        };
    },

    /**
     * Render raphael graph.
     * @param {{width: number, height: number}} dimension dimension
     * @private
     * @override
     */
    _renderGraph: function() {
        if (!this.graphContainer) {
            this.graphContainer = dom.create('DIV', 'tui-chart-series-graph-area');
            this.seriesContainer.appendChild(this.graphContainer);
        }

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);

        this._setLimitPositionToMoveMap();

        this.graphRenderer.render(this.graphContainer, {
            colorModel: this.data.colorModel,
            map: this.data.map,
            dimension: this.graphDimension,
            mapDimension: this.mapModel.getMapDimension(),
            valueMap: this.dataProcessor.getValueMap()
        });
    },

    /**
     * Render series label.
     * @param {HTMLElement} seriesLabelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(seriesLabelContainer) {
        var html = tui.util.map(this.mapModel.getLabelData(this.zoomMagn * this.mapRatio), function(datum, index) {
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
     * Render series area.
     * @param {HTMLElement} seriesContainer series area element
     * @param {object} data data for rendering
     * @param {function} funcRenderGraph function for graph rendering
     * @private
     */
    _renderSeriesArea: function(seriesContainer, data, funcRenderGraph) {
        Series.prototype._renderSeriesArea.call(this, seriesContainer, data, funcRenderGraph);
        this.graphContainer.appendChild(this.seriesLabelContainer);
    },

    /**
     * Adjust map position.
     * @param {{left: number, top: number}} targetPosition target position
     * @returns {{left: number, top: number}} adjusted position
     * @private
     */
    _adjustMapPosition: function(targetPosition) {
        return {
            left: Math.max(Math.min(targetPosition.left, 0), this.limitPosition.left),
            top: Math.max(Math.min(targetPosition.top, 0), this.limitPosition.top)
        };
    },

    /**
     * Update base position for zoom.
     * @param {{width: number, height: number}} prevDimension previous dimension
     * @param {{left: number, top: number}} prevLimitPosition previous limit position
     * @param {number} changedRatio changed ratio
     * @private
     */
    _updateBasePositionForZoom: function(prevDimension, prevLimitPosition, changedRatio) {
        var prevBasePosition = this.basePosition,
            prevLeft = prevBasePosition.left - (prevLimitPosition.left / 2),
            prevTop = prevBasePosition.top - (prevLimitPosition.top / 2),
            newBasePosition = {
                left: (prevLeft * changedRatio) + (this.limitPosition.left / 2),
                top: (prevTop * changedRatio) + (this.limitPosition.top / 2)
            };

        this.basePosition = this._adjustMapPosition(newBasePosition);
    },

    /**
     * Zoom.
     * @param {number} changedRatio changed ratio
     * @private
     */
    _zoom: function(changedRatio) {
        var prevDimension = this.graphDimension,
            prevLimitPosition = this.limitPosition;

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);
        this.graphRenderer.setSize(this.graphDimension);

        this._setLimitPositionToMoveMap();
        this._updateBasePositionForZoom(prevDimension, prevLimitPosition, changedRatio);
        renderUtil.renderPosition(this.graphContainer, this.basePosition);

        this._renderSeriesLabel(this.seriesLabelContainer);
    },

    /**
     * Update positions to resize.
     * @param {number} prevMapRatio previous ratio
     * @private
     */
    _updatePositionsToResize: function(prevMapRatio) {
        var changedRatio = this.mapRatio / prevMapRatio;

        this.basePosition.left *= changedRatio;
        this.basePosition.top *= changedRatio;

        this.limitPosition.left *= changedRatio;
        this.limitPosition.top *= changedRatio;
    },

    /**
     * Resize graph.
     * @private
     */
    _resizeGraph: function() {
        var prevRatio = this.mapRatio;

        this._setMapRatio();

        this._setGraphDimension();
        renderUtil.renderDimension(this.graphContainer, this.graphDimension);
        this.graphRenderer.setSize(this.graphDimension);

        this._updatePositionsForResizing(prevRatio);
        renderUtil.renderPosition(this.graphContainer, this.basePosition);

        this._renderSeriesLabel(this.seriesLabelContainer);
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
        this.startPosition = {
            left: position.left - this.basePosition.left,
            top: position.top - this.basePosition.top
        };
    },

    /**
     * On drag series.
     * @param {{left: number, top: number}} position position
     */
    onDragSeries: function(position) {
        var movePosition = this._adjustMapPosition({
            left: position.left - this.startPosition.left,
            top: position.top - this.startPosition.top
        });

        renderUtil.renderPosition(this.graphContainer, movePosition);
        this.basePosition = movePosition;
    },

    /**
     * On drag end series.
     */
    onDragEndSeries: function() {},

    /**
     * On zoom.
     * @param {number} newMagn new zoom magnification
     */
    onZoom: function(newMagn) {
        var changeRatio = newMagn / this.zoomMagn;

        this.zoomMagn = newMagn;

        this._zoom(changeRatio);
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
