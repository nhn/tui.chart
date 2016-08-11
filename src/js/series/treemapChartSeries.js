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
var predicate = require('../helpers/predicate');

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
         * start depth of seriesItem for rendering graph
         * @type {number}
         */
        this.startDepth = 1;

        /**
         * selected group
         * @type {null | number}
         */
        this.selectedGroup = null;

        /**
         * bound map
         * @type {null|object.<string, object>}
         */
        this.boundMap = null;

        this._initOptions();
    },

    /**
     * Initialize options.
     * @private
     */
    _initOptions: function() {
        this.options.useColorValue = !!this.options.useColorValue;

        if (tui.util.isUndefined(this.options.zoomable)) {
            this.options.zoomable = !this.options.useColorValue;
        }

        if (tui.util.isUndefined(this.options.useLeafLabel)) {
            this.options.useLeafLabel = !this.options.zoomable;
        }
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
        var boundMap = this._getBoundMap();

        return {
            boundMap: boundMap,
            groupBounds: this._makeBounds(boundMap),
            seriesDataModel: this._getSeriesDataModel(),
            startDepth: this.startDepth,
            isPivot: true,
            colorSpectrum: this.options.useColorValue ? this.data.colorSpectrum : null,
            chartBackground: this.chartBackground,
            zoomable: this.options.zoomable
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

        dimension = dimension || this.boundsMaker.getDimension('series');
        seriesItems = seriesDataModel.findSeriesItemsByParent(parent);
        boundMap = tui.util.extend(boundMap || {}, squarifier.squarify(dimension, seriesItems));

        tui.util.forEachArray(seriesItems, function(seriesItem) {
            boundMap = self._makeBoundMap(seriesItem.id, boundMap, boundMap[seriesItem.id]);
        });

        return boundMap;
    },

    /**
     * Make bounds for rendering graph.
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @returns {Array.<Array.<{left: number, top: number, width: number, height: number}>>}
     * @private
     */
    _makeBounds: function(boundMap) {
        var startDepth = this.startDepth;
        var seriesDataModel = this._getSeriesDataModel();
        var isValid;

        if (this.options.zoomable) {
            isValid = function(seriesItem) {
                return seriesItem.depth === startDepth;
            };
        } else {
            isValid = function(seriesItem) {
                return !seriesItem.hasChild;
            };
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var bound = boundMap[seriesItem.id];
                var result = null;

                if (bound && isValid(seriesItem)) {
                    result = {
                        end: bound
                    };
                }

                return result;
            }, true);
        }, true);
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
     * Whether should dimmed or not.
     * @param {SeriesDataModel} seriesDataModel - SeriesDataModel for treemap
     * @param {SeriesItem} hoverSeriesItem - hover SeriesItem
     * @param {SeriesItem} seriesItem - target SeriesItem
     * @returns {boolean}
     * @private
     */
    _shouldDimmed: function(seriesDataModel, hoverSeriesItem, seriesItem) {
        var shouldTransparent = false;
        var parent;

        if (hoverSeriesItem && seriesItem.id !== hoverSeriesItem.id && seriesItem.group === hoverSeriesItem.group) {
            parent = seriesDataModel.findParentByDepth(seriesItem.id, hoverSeriesItem.depth + 1);

            if (parent && parent.parent === hoverSeriesItem.id) {
                shouldTransparent = true;
            }
        }

        return shouldTransparent;
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer - series label container
     * @param {SeriesItem} hoverSeriesItem - hover SeriesItem
     * @private
     */
    _renderSeriesLabel: function(labelContainer, hoverSeriesItem) {
        var seriesDataModel = this._getSeriesDataModel();
        var boundMap = this._getBoundMap();
        var seriesItems, shouldDimmed, html;

        if (this.options.useLeafLabel) {
            seriesItems = seriesDataModel.findLeafSeriesItems(this.selectedGroup);
        } else {
            seriesItems = seriesDataModel.findSeriesItemsByDepth(this.startDepth, this.selectedGroup);
        }

        shouldDimmed = tui.util.bind(this._shouldDimmed, this, seriesDataModel, hoverSeriesItem);
        html = labelHelper.makeLabelsHtmlForTreemap(seriesItems, boundMap, this.theme.label, shouldDimmed);

        labelContainer.innerHTML = html;
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
     * Zoom.
     * @param {string | number} rootId - root id
     * @param {number} startDepth - start depth
     * @param {number} group - group
     * @private
     */
    _zoom: function(rootId, startDepth, group) {
        this._clearContainer();
        this.boundMap = null;
        this.rootId = rootId;
        this.startDepth = startDepth;
        this.selectedGroup = group;
        this._renderSeriesArea(this.seriesContainer, this.data, tui.util.bind(this._renderGraph, this));

        if (predicate.isShowLabel(this.options)) {
            this._showSeriesLabelWithoutAnimation();
        }
    },

    /**
     * Zoom
     * @param {{index: number}} data - data for zoom
     */
    zoom: function(data) {
        var detectedIndex = data.index;
        var seriesDataModel, seriesItem;

        if (detectedIndex === -1) {
            this._zoom(chartConst.TREEMAP_ROOT_ID, 1, null);

            return;
        }

        seriesDataModel = this._getSeriesDataModel();
        seriesItem = seriesDataModel.getSeriesItem(0, detectedIndex, true);

        if (!seriesItem || !seriesItem.hasChild) {
            return;
        }

        this._zoom(seriesItem.id, seriesItem.depth + 1, seriesItem.group);
        this.fire('afterZoom', detectedIndex);
    },

    /**
     * Make exportation data for series type userEvent.
     * @param {object} seriesData series data
     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
     * @private
     */
    _makeExportationSeriesData: function(seriesData) {
        var indexes = seriesData.indexes;
        var seriesItem = this._getSeriesDataModel().getSeriesItem(indexes.groupIndex, indexes.index, true);

        return tui.util.extend({
            chartType: this.chartType,
            indexes: seriesItem.indexes
        });
    },

    /**
     * To call showAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} indexes - indexes
     */
    onShowAnimation: function(indexes) {
        var seriesItem;

        if (!predicate.isShowLabel(this.options)) {
            return;
        }

        seriesItem = this._getSeriesDataModel().getSeriesItem(indexes.groupIndex, indexes.index, true);

        this._renderSeriesLabel(this.seriesLabelContainer, seriesItem);
        this.graphRenderer.showAnimation(indexes, this.options.useColorValue, 0.6);
    },

    /**
     * To call hideAnimation function of graphRenderer.
     * @param {{groupIndex: number, index: number}} indexes - indexes
     */
    onHideAnimation: function(indexes) {
        if (!predicate.isShowLabel(this.options) || !indexes) {
            return;
        }

        this._renderSeriesLabel(this.seriesLabelContainer);
        this.graphRenderer.hideAnimation(indexes, this.options.useColorValue);
    },

    /**
     * On show tooltip for calling showWedge.
     * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
     */
    onShowTooltip: function(params) {
        var seriesDataModel = this._getSeriesDataModel();
        var indexes = params.indexes;
        var ratio = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true).ratio;

        if (ratio > -1) {
            this.fire('showWedge', ratio);
        }
    }
});

tui.util.CustomEvents.mixin(TreemapChartSeries);

module.exports = TreemapChartSeries;
