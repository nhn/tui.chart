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

var BoundsTypeEventDetector = tui.util.defineClass(EventDetectorBase, /** @lends BoundsTypeEventDetector.prototype */ {
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
         * @type {number}
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
     * Hide tooltip.
     * @private
     */
    _hideTooltip: function() {
        this.eventBus.fire('hideTooltip', this.prevFoundData);
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
        var layerPosition = this._calculateLayerPosition(e.clientX, e.clientY);
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
        }

        this.eventBus.fire('showTooltip', foundData);
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
        // getBoundingClientRect()값 캐싱 금지 - 차트 위치 변경 시 오류 발생
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

        EventDetectorBase.prototype._onMouseout.call(this);
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
    }
});

function BoundsTypeEventDetectorFactory(params) {
    var chartType = params.chartOptions.chartType;
    var seriesAllowSelect = params.chartOptions.series.allowSelect;
    var isVertical;

    if (chartType === 'bar') {
        isVertical = false;
    } else if (chartType === 'column') {
        isVertical = true;
    }

    params.isVertical = isVertical;
    params.allowSelect = seriesAllowSelect;

    return new BoundsTypeEventDetector(params);
}

BoundsTypeEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = BoundsTypeEventDetectorFactory;
