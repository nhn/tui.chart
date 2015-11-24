/**
 * @fileoverview _GroupTooltipPositionModel is .
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

var GroupTooltipPositionModel = tui.util.defineClass(/** @lends GroupTooltipPositionModel.prototype */ {
    init: function(chartDimension, areaBound, isVertical, options) {
        this.chartDimension = chartDimension;
        this.areaBound = areaBound;
        this.isVertical = isVertical;
        this._setData(chartDimension, areaBound, isVertical, options);
    },

    _setData: function(chartDimension, areaBound, isVertical, options) {
        var vDirection = this.getVerticalDirection(options.align),
            hDirection = this._getHorizontalDirection(options.align),
            verticalData = {
                positionType: 'left',
                sizeType: 'width',
                direction: hDirection,
                areaPosition: areaBound.position.left,
                areaSize: areaBound.dimension.width,
                chartSize: chartDimension.width,
                basePosition: chartConst.SERIES_EXPAND_SIZE
            },
            horizontalData = {
                positionType: 'top',
                sizeType: 'height',
                direction: vDirection,
                areaPosition: areaBound.position.top,
                areaSize: areaBound.dimension.height,
                chartSize: chartDimension.height,
                basePosition: 0
            };
        if (isVertical) {
            this.mainData = verticalData;
            this.subData = horizontalData;
        } else {
            this.mainData = horizontalData;
            this.subData = verticalData;
        }

        this.positionOption = tui.util.extend({
            left: 0,
            top: 0
        }, options.position);
    },

    _getHorizontalDirection: function(align) {
        var direction;
        align = align || '';
        if (align.indexOf('left') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (align.indexOf('center') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        }
        return direction;
    },

    getVerticalDirection: function(align) {
        var direction;
        align = align || '';
        if (align.indexOf('top') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_BACKWARD;
        } else if (align.indexOf('bottom') > -1) {
            direction = chartConst.TOOLTIP_DIRECTION_FORWARD;
        } else {
            direction = chartConst.TOOLTIP_DIRECTION_CENTER;
        }
        return direction;
    },

    _calculateMainPositionValue: function(tooltipSize, range, direction, basePosition) {
        var isLine = (range.start === range.end),
            padding = isLine ? 9 : 5,
            value = basePosition;
        if (direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value += range.end + padding;
        } else if (direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value += range.start - tooltipSize - padding;
        } else if (isLine) {
            value += range.start - tooltipSize / 2;
        } else {
            value += range.start + ((range.end - range.start - tooltipSize) / 2);
        }
        return value;
    },

    _calculateSubPositionValue: function(areaSize, tooltipSize, direction, basePosition) {
        var middle = areaSize / 2,
            value;
        if (direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = middle + basePosition;
        } else if (direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = middle - tooltipSize + basePosition;
        } else {
            value = middle - (tooltipSize / 2) + basePosition;
        }
        return value;
    },

    _makePositionValueDiff: function(value, chartSize, areaPosition, tooltipSize) {
        return value + areaPosition + tooltipSize - chartSize;
    },

    _adjustBackwordPositionValue: function(value, range, chartSize, areaPosition, tooltipSize, basePosition) {
        var changedValue;
        if (value < -areaPosition) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, chartConst.TOOLTIP_DIRECTION_FORWARD, basePosition);
            if (this._makePositionValueDiff(changedValue, chartSize, areaPosition, tooltipSize) > 0) {
                value = -areaPosition;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    __adjustForwardPositionValue: function(value, range, chartSize, areaPosition, tooltipSize, basePosition) {
        var diff = this._makePositionValueDiff(value, chartSize, areaPosition, tooltipSize),
            changedValue;
        if (diff > 0) {
            changedValue = this._calculateMainPositionValue(tooltipSize, range, chartConst.TOOLTIP_DIRECTION_BACKWARD, basePosition);
            if (changedValue < -areaPosition) {
                value -= diff;
            } else {
                value = changedValue;
            }
        }
        return value;
    },

    _adjustMainPositionValue: function(value, range, chartSize, areaPosition, tooltipSize, direction, basePosition) {
        if (direction === chartConst.TOOLTIP_DIRECTION_BACKWARD) {
            value = this._adjustBackwordPositionValue(value, range, chartSize, areaPosition, tooltipSize, basePosition);
        } else if (direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = this.__adjustForwardPositionValue(value, range, chartSize, areaPosition, tooltipSize, basePosition);
        } else {
            value = tui.util.max([value, -areaPosition]);
            value = tui.util.min([value, chartSize - areaPosition - tooltipSize]);
        }
        return value;
    },

    _adjustSubPositionValue: function(value, chartSize, areaPosition, tooltipSize, direction) {
        if (direction === chartConst.TOOLTIP_DIRECTION_FORWARD) {
            value = tui.util.min([value, chartSize - areaPosition - tooltipSize]);
        } else {
            value = tui.util.max([value, -areaPosition]);
        }
        return value;
    },

    calculatePosition: function(tooltipDimension, range) {
        var main = this.mainData,
            sub = this.subData,
            position = {},
            mainPosition, subPosition;
        mainPosition = this._calculateMainPositionValue(tooltipDimension[main.sizeType], range, main.direction, main.basePosition);
        subPosition = this._calculateSubPositionValue(sub.areaSize, tooltipDimension[sub.sizeType], sub.direction, sub.basePosition);

        mainPosition = mainPosition + this.positionOption[main.positionType];
        subPosition = subPosition + this.positionOption[sub.positionType];

        mainPosition = this._adjustMainPositionValue(mainPosition, range, main.chartSize, main.areaPosition, tooltipDimension[main.sizeType], main.direction, main.basePosition);
        subPosition = this._adjustSubPositionValue(subPosition, sub.chartSize, main.areaPosition, tooltipDimension[sub.sizeType], sub.direction);

        position[main.positionType] = mainPosition;
        position[sub.positionType] = subPosition;

        return position;
    },

    updateData: function(options) {
        this._setData(this.chartDimension, this.areaBound, this.isVertical, options);
    }
});

module.exports = GroupTooltipPositionModel;
