/**
 * @fileoverview GroupedEventHandleLayer is event handle layer for grouped toolip option.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var EventHandleLayerBase = require('./eventHandleLayerBase'),
    chartConst = require('../const'),
    state = require('../helpers/state');

var GroupedEventHandleLayer = ne.util.defineClass(EventHandleLayerBase, /** @lends GroupedEventHandleLayer.prototype */ {
    /**
     * GroupedEventHandleLayer is event handle layer for grouped toolip option.
     * @constructs EventHandleLayerBase
     * @extends EventHandleLayerBase
     */
    init: function() {
        EventHandleLayerBase.apply(this, arguments);
    },

    /**
     * To make coordinate data about non line type chart.
     * @param {number} size width or height
     * @param {number} tickCount tick count
     * @returns {array} coordinate data
     * @private
     */
    _makeNormalCoordinateData: function(size, tickCount) {
        var len = tickCount - 1,
            tickInterval = size / len,
            prev = 0;
        return ne.util.map(ne.util.range(0, len), function(index) {
            var max = ne.util.min([size, (index + 1) * tickInterval]),
                scale = {
                    min: prev,
                    max: max
                };
            prev = max;
            return scale;
        });
    },

    /**
     * To make coordinate data.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {string} chartType chart type
     * @returns {array.<{min: number, max: number}>} tick groups
     * @private
     */
    makeCoordinateData: function(dimension, tickCount, chartType) {
        var sizeType = this.isVertical ? 'width' : 'height',
            coordinateData;
        if (state.isLineTypeChart(chartType)) {
            coordinateData = this.makeLineTypeCoordinateData(dimension[sizeType], tickCount);
        } else {
            coordinateData = this._makeNormalCoordinateData(dimension[sizeType], tickCount);
        }

        return coordinateData;
    },

    /**
     * To make range of tooltip position.
     * @param {{min: number, max: number}} scale scale
     * @param {string} chartType chart type
     * @returns {{start: number, end: number}} range type value
     * @private
     */
    _makeRange: function(scale, chartType) {
        var range, center;
        if (state.isLineTypeChart(chartType)) {
            center = scale.max - (scale.max - scale.min) / 2;
            range = {
                start: center,
                end: center
            };
        } else {
            range = {
                start: scale.min,
                end: scale.max
            };
        }

        return range;
    },

    /**
     * Get layer position.
     * @param {MouseEvent} e mouse event object
     * @param {{top: number, right: number, bottom: number, left: number}} bound bound
     * @param {boolean} isVertical whether vertical or not
     * @returns {number} layer position (left or top)
     * @private
     */
    _getLayerPositionValue: function(e, bound, isVertical) {
        var layerPosition;
        if (isVertical) {
            layerPosition = e.clientX - bound.left;
        } else {
            layerPosition = e.clientY - bound.top;
        }
        return layerPosition;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event obejct
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerPositionValue = this._getLayerPositionValue(e, bound, this.isVertical),
            index = this.findIndex(layerPositionValue),
            prevIndex = this.prevIndex,
            sizeType = this.isVertical ? 'height' : 'width',
            direction;

        if (index === -1 || prevIndex === index) {
            return;
        }

        this.prevIndex = index;
        direction = this.coordinateData.length / 2 > index + 1 ? chartConst.TOOLTIP_DIRECTION_FORWORD : chartConst.TOOLTIP_DIRECTION_BACKWORD;
        this.fire('showGroupTooltip', {
            index: index,
            range: this._makeRange(this.coordinateData[index], this.chartType),
            size: this.bound.dimension[sizeType],
            direction: direction,
            isVertical: this.isVertical
        });
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     */
    onMouseout: function() {
        delete this.prevIndex;
        this.fire('hideGroupTooltip');
    }
});

ne.util.CustomEvents.mixin(GroupedEventHandleLayer);

module.exports = GroupedEventHandleLayer;
