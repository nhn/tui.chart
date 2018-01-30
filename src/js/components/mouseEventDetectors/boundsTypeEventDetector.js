/**
 * @fileoverview BoundsTypeEventDetector is mouse event detector for bounds type charts
 *                                                                              like bar, column, heatmap, treemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var EventDetectorBase = require('./mouseEventDetectorBase');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var dom = require('../../helpers/domHandler');
var snippet = require('tui-code-snippet');

var BoundsTypeEventDetector = snippet.defineClass(EventDetectorBase, /** @lends BoundsTypeEventDetector.prototype */ {
    /**
     * BoundsTypeEventDetector is mouse event detector for bounds type charts like bar, column, heatmap, treemap.
     * @constructs BoundsTypeEventDetector
     * @private
     * @extends EventDetectorBase
     */
    init: function() {
        EventDetectorBase.apply(this, arguments);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        /**
         * history array for treemap chart.
         * @type {array}
         */
        this.zoomHistory = [-1];

        /**
         * button for zoom history back
         * @type {null | HTMLElement}
         */
        this.historyBackBtn = null;
    },

    /**
     * Attach to event bus.
     * @private
     * @override
     */
    _attachToEventBus: function() {
        EventDetectorBase.prototype._attachToEventBus.call(this);

        this.eventBus.on('afterZoom', this.onAfterZoom, this);
    },

    /**
     * Show tooltip.
     * @param {object} foundData - model data
     * @private
     */
    _showTooltip: function(foundData) {
        this.eventBus.fire('showTooltip', foundData);
        this.prevFoundData = foundData;
    },

    /**
     * Hide tooltip.
     * @param {{silent: {boolean}}} [options] - options for hiding a tooltip
     * @private
     */
    _hideTooltip: function(options) {
        this.eventBus.fire('hideTooltip', this.prevFoundData, options);
        this.prevFoundData = null;
        this.styleCursor(false);
    },

    /**
     * Style css cursor.
     * @param {boolean} hasChild - whether has child or not
     */
    styleCursor: function(hasChild) {
        var container = this.mouseEventDetectorContainer;
        if (hasChild) {
            container.style.cursor = 'pointer';
        } else {
            container.style.cursor = 'default';
        }
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var clientX = e.clientX;
        var clientY = e.clientY;
        var layerPosition = this._calculateLayerPosition(clientX, clientY);
        var foundData = this._findDataFromBoundsCoordinateModel(layerPosition);
        var seriesItem;

        if (!this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;

        if (!foundData) {
            return;
        }

        if (predicate.isTreemapChart(this.chartType)) {
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);
            this.styleCursor(seriesItem.hasChild);
        } else if (predicate.isBulletChart(this.chartType)) {
            foundData.mousePosition = {
                left: clientX,
                top: clientY
            };
        }
        this._showTooltip(foundData);
    },

    /**
     * Zoom history back.
     * @private
     */
    _zoomHistoryBack: function() {
        var index = this.zoomHistory[this.zoomHistory.length - 2];

        this.zoomHistory.pop();
        this.eventBus.fire('zoom', index);

        if (this.zoomHistory.length === 1) {
            this.mouseEventDetectorContainer.removeChild(this.historyBackBtn);
            this.historyBackBtn = null;
        }
    },

    /**
     * Get seriesItem by indexes
     * @param {{groupIndex: number, index: number}} indexes - indexes
     * @returns {SeriesItem}
     * @private
     */
    _getSeriesItemByIndexes: function(indexes) {
        var seriesDataModel = this.dataProcessor.getSeriesDataModel(chartConst.CHART_TYPE_TREEMAP);

        return seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index, true);
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onClick: function(e) {
        var target = e.target || e.srcElement;
        var layerPosition, foundData, seriesItem;

        EventDetectorBase.prototype._onClick.call(this, e);

        if (!predicate.isTreemapChart(this.chartType)) {
            return;
        }

        if (dom.hasClass(target, chartConst.CLASS_NAME_RESET_ZOOM_BTN)) {
            this._hideTooltip();
            this._zoomHistoryBack();

            return;
        }

        layerPosition = this._calculateLayerPosition(e.clientX, e.clientY);
        foundData = this._findDataFromBoundsCoordinateModel(layerPosition);

        if (foundData) {
            seriesItem = this._getSeriesItemByIndexes(foundData.indexes);

            if (!seriesItem.hasChild) {
                return;
            }

            this._hideTooltip();
            this.eventBus.fire('zoom', foundData.indexes.index);
        }
    },

    /**
     * On mouseout.
     * @override
     */
    _onMouseout: function(e) {
        // do not cache getBoundingClientRect() - if not, it will cause error when chart location changed
        var bound = this.mouseEventDetectorContainer.getBoundingClientRect();
        var clientX = e.clientX;
        var clientY = e.clientY;

        if ((bound.left <= clientX) && (bound.top <= clientY) &&
            (bound.right >= clientX) && (bound.bottom >= clientY)) {
            return;
        }

        if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = null;
    },

    /**
     * On after zoom.
     * @param {number} index - index of target seriesItem
     */
    onAfterZoom: function(index) {
        if (!this.historyBackBtn) {
            this.historyBackBtn = dom.create('DIV', chartConst.CLASS_NAME_RESET_ZOOM_BTN);
            this.historyBackBtn.innerHTML = '< Back';
            dom.append(this.mouseEventDetectorContainer, this.historyBackBtn);
        }

        if (this.zoomHistory[this.zoomHistory.length - 1] !== index) {
            this.zoomHistory.push(index);
        }
    },

    /**
     * Find data by indexes.
     * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
     * @param {number} [indexes.outlierIndex] - index of outlier of boxplot series, it only exists in boxplot chart
     * @returns {object} - series item data
     */
    findDataByIndexes: function(indexes) {
        return this.boundsBaseCoordinateModel.findDataByIndexes(indexes);
    }
});

function boundsTypeEventDetectorFactory(params) {
    return new BoundsTypeEventDetector(params);
}

boundsTypeEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = boundsTypeEventDetectorFactory;
