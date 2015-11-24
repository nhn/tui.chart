/**
 * @fileoverview GroupTypeCustomEvent is event handle layer for grouped toolip option.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CustomEventBase = require('./customEventBase'),
    chartConst = require('../const');

var GroupTypeCustomEvent = tui.util.defineClass(CustomEventBase, /** @lends GroupTypeCustomEvent.prototype */ {
    /**
     * GroupTypeCustomEvent is event handle layer for grouped toolip option.
     * @constructs GroupTypeCustomEvent
     * @extends CustomEventBase
     */
    init: function() {
        CustomEventBase.apply(this, arguments);
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
            layerPosition = e.clientX - chartConst.SERIES_EXPAND_SIZE - bound.left;
        } else {
            layerPosition = e.clientY - bound.top;
        }
        return layerPosition;
    },

    /**
     * Get tooltip direction.
     * @param {number} index index
     * @returns {string} direction
     * @private
     */
    _getTooltipDirection: function(index) {
        var standardNumber = Math.ceil(this.tickBaseDataModel.getLength() / 2),
            number = index + 1;
        // 중앙을 기준으로 중앙을 포함하여 앞부분에 위치하는 data는 forword를 반환하고, 뒷부분에 위치하는 data는 backword를 반환한다.
        return standardNumber >= number ? chartConst.TOOLTIP_DIRECTION_FORWORD : chartConst.TOOLTIP_DIRECTION_BACKWORD;
    },

    /**
     * On mousemove.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerPositionValue = this._getLayerPositionValue(e, bound, this.isVertical),
            index = this.tickBaseDataModel.findIndex(layerPositionValue),
            prevIndex = this.prevIndex,
            sizeType = this.isVertical ? 'height' : 'width',
            direction;

        if (index === -1) {
            this.onMouseout();
            return;
        }

        if (prevIndex === index) {
            return;
        }

        this.prevIndex = index;

        direction = this._getTooltipDirection(index);

        this.fire('showGroupTooltip', {
            index: index,
            isLastIndex: this.tickBaseDataModel.getLength() - 1 === index,
            range: this.tickBaseDataModel.makeRange(index, this.chartType),
            size: this.bound.dimension[sizeType],
            direction: direction,
            isVertical: this.isVertical
        });
    },

    /**
     * On mouseout.
     * @param {MouseEvent} e mouse event object
     * @override
     */
    onMouseout: function() {
        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupTooltip', this.prevIndex);
            delete this.prevIndex;
        }
    }
});

tui.util.CustomEvents.mixin(GroupTypeCustomEvent);

module.exports = GroupTypeCustomEvent;
