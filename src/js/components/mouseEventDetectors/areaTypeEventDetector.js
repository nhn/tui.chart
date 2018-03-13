/**
 * @fileoverview AreaTypeEventDetector is mouse event detector for line type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var MouseEventDetectorBase = require('./mouseEventDetectorBase');
var zoomMixer = require('./zoomMixer');
var AreaTypeDataModel = require('./areaTypeDataModel');
var snippet = require('tui-code-snippet');

var AREA_DETECT_DISTANCE_THRESHHOLD = 50;

var AreaTypeEventDetector = snippet.defineClass(MouseEventDetectorBase, /** @lends AreaTypeEventDetector.prototype */ {
    /**
     * AreaTypeEventDetector is mouse event detector for line type chart.
     * @param {object} params parameters
     * @constructs AreaTypeEventDetector
     * @private
     * @extends MouseEventDetectorBase
     */
    init: function(params) {
        MouseEventDetectorBase.call(this, params);

        /**
         * previous found data
         * @type {null | object}
         */
        this.prevFoundData = null;

        /**
         * previous client position of mouse event (clientX, clientY)
         * @type {null | object}
         */
        this.prevClientPosition = null;

        /**
         * whether zoomable or not
         * @type {boolean}
         */
        this.zoomable = params.zoomable;

        if (this.zoomable) {
            snippet.extend(this, zoomMixer);
            this._initForZoom(params.zoomable);
        }
    },

    /**
     * Animate for adding data.
     */
    animateForAddingData: function() {
        var foundData, isMoving;

        if (!this.prevClientPosition) {
            return;
        }

        foundData = this._findData(this.prevClientPosition.x, this.prevClientPosition.y);

        if (foundData) {
            isMoving = this.prevFoundData && (this.prevFoundData.indexes.groupIndex === foundData.indexes.groupIndex);
            this._showTooltip(foundData, isMoving);
        }

        this.prevFoundData = foundData;
    },

    /**
     * Create areaTypeDataModel from seriesItemBoundsData for mouse event detector.
     * @param {Array.<object>} seriesItemBoundsDatum - series item bounds datum
     * @override
     */
    onReceiveSeriesData: function(seriesItemBoundsDatum) {
        var seriesItemBoundsData = this.seriesItemBoundsData;
        var seriesCount = this.seriesCount;

        if (seriesItemBoundsData.length === seriesCount) {
            seriesItemBoundsData = [];
        }

        seriesItemBoundsData.push(seriesItemBoundsDatum);

        if (seriesItemBoundsData.length === seriesCount) {
            this.dataModel = new AreaTypeDataModel(seriesItemBoundsData);
        }

        if (this.zoomable) {
            this._showTooltipAfterZoom();
        }
    },

    /**
     * Find data by client position.
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     * @override
     */
    _findData: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);
        var selectLegendIndex = this.dataProcessor.selectLegendIndex;

        return this.dataModel.findData(layerPosition, AREA_DETECT_DISTANCE_THRESHHOLD, selectLegendIndex);
    },

    /**
     * Find data by client position for zoomable
     * @param {number} clientX - clientX
     * @param {number} clientY - clientY
     * @returns {object}
     * @private
     */
    _findDataForZoomable: function(clientX, clientY) {
        var layerPosition = this._calculateLayerPosition(clientX, clientY);

        return this.dataModel.findData(layerPosition);
    },

    /**
     * Get first model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getFirstData: function(index) {
        return this.dataModel.getFirstData(index);
    },

    /**
     * Get last model data.
     * @param {number} index - index
     * @returns {object}
     * @private
     */
    _getLastData: function(index) {
        return this.dataModel.getLastData(index);
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
     * @param {{silent: {boolean}}} [options] - options for hiding tooltip
     * @private
     */
    _hideTooltip: function(options) {
        this.eventBus.fire('hideTooltip', this.prevFoundData, options);
        this.prevFoundData = null;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e - mouse event
     * @private
     * @override
     */
    _onMousemove: function(e) {
        var dragMoseupResult, foundData;

        this._setPrevClientPosition(e);

        foundData = this._findData(e.clientX, e.clientY);

        if (this.zoomable) {
            dragMoseupResult = this._isAfterDragMouseup();
        }

        if (dragMoseupResult || !this._isChangedSelectData(this.prevFoundData, foundData)) {
            return;
        }

        if (foundData) {
            this._showTooltip(foundData);
        } else if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevFoundData = foundData;
    },

    /**
     * On mouseout.
     * @private
     * @override
     */
    _onMouseout: function() {
        if (this.prevFoundData) {
            this._hideTooltip();
        }

        this.prevClientPosition = null;
        this.prevFoundData = null;
    },

    /**
     * find data by indexes
     * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
     * @returns {object} - series item data
     */
    findDataByIndexes: function(indexes) {
        return this.dataModel.findDataByIndexes(indexes);
    },

    /**
     * Set prevClientPosition by MouseEvent
     * @param {?MouseEvent} event - mouse event
     */
    _setPrevClientPosition: function(event) {
        if (!event) {
            this.prevClientPosition = null;
        } else {
            this.prevClientPosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    }
});

function areaTypeEventDetectorFactory(params) {
    return new AreaTypeEventDetector(params);
}

areaTypeEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = areaTypeEventDetectorFactory;
