/**
 * @fileoverview Series component for rendering graph of treemap chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series');
var squarifier = require('./squarifier');
var labelHelper = require('./renderingLabelHelper');
var chartConst = require('../const');

var TreemapChartSeries = tui.util.defineClass(Series, /** @lends TreemapChartSeries.prototype */ {
    /**
     * Series component for rendering graph of treemap chart.
     * @constructs TreemapChartSeries
     * @extends Series
     */
    init: function() {
        Series.apply(this, arguments);

        this.theme.borderColor = this.theme.borderColor || chartConst.TREEMAP_DEFAULT_BORDER;

        /**
         * root id
         * @type {string}
         */
        this.rootId = chartConst.TREEMAP_ROOT_ID;

        /**
         * start depth
         * @type {number}
         */
        this.startDepth = 1;

        /**
         * selected group
         * @type {null | number}
         */
        this.selectedGroup = null;
    },

    /**
     * Make series data.
     * @returns {{
     *      groupBounds: object.<string, {left: number, top: number, width: number, height: number}>,
     *      seriesDataModel: SeriesDataModel
     * }}
     * @private
     * @override
     */
    _makeSeriesData: function() {
        return {
            groupBounds: this._makeBounds(),
            seriesDataModel: this._getSeriesDataModel()
        };
    },

    /**
     * Make bound map by dimension.
     * @param {string | number} parent - parent id
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @param {{width: number, height: number}} dimension - dimension
     * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
     * @private
     */
    _makeBoundMap: function(parent, boundMap, dimension) {
        var self = this;
        var seriesDataModel = this._getSeriesDataModel();
        var seriesItems;

        boundMap = boundMap || {};

        dimension = dimension || this.boundsMaker.getDimension('series');
        seriesItems = seriesDataModel.findSeriesItemsByParent(parent);

        boundMap = tui.util.extend(boundMap, squarifier.squarify(dimension, seriesItems));

        tui.util.forEachArray(seriesItems, function(seriesItem) {
            boundMap = self._makeBoundMap(seriesItem.id, boundMap, boundMap[seriesItem.id]);
        });

        return boundMap;
    },

    /**
     * Make bounds for rendering graph.
     * @returns {*|Array}
     * @private
     */
    _makeBounds: function() {
        var boundMap = this._getBoundMap();
        var seriesDataModel = this._getSeriesDataModel();

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var bound = boundMap[seriesItem.id];
                return bound ? {
                    end: bound
                } : null;
            }, true);
        });
    },

    /**
     * Get bound map for rendering graph.
     * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
     * @private
     */
    _getBoundMap: function() {
        if (!this.boundMap) {
            this.boundMap = this._makeBoundMap(this.rootId);
        }

        return this.boundMap;
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - series label container
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        var seriesDataModel = this._getSeriesDataModel();
        var seriesItems = seriesDataModel.findSeriesItemsByDepth(this.startDepth, this.selectedGroup);
        var boundMap = this._getBoundMap();
        var html = labelHelper.makeLabelsHtmlForTreemap(seriesItems, boundMap, this.theme.label);

        labelContainer.innerHTML = html;
    }
});

tui.util.CustomEvents.mixin(TreemapChartSeries);

module.exports = TreemapChartSeries;
