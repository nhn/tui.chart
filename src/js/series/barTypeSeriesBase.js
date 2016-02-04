/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {object} add data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        this.groupBounds = this._makeBounds(this.boundsMaker.getDimension('series'));

        return {
            groupBounds: this.groupBounds,
            groupValues: this._getPercentValues()
        };
    },

    /**
     * Make bar gutter.
     * @param {number} groupSize bar group size
     * @param {number} itemCount group item count
     * @returns {number} bar gutter
     * @private
     */
    _makeBarGutter: function(groupSize, itemCount) {
        var baseSize = groupSize / (itemCount + 1) / 2,
            gutter;

        if (baseSize <= 2) {
            gutter = 0;
        } else if (baseSize <= 6) {
            gutter = 2;
        } else {
            gutter = 4;
        }
        return gutter;
    },

    /**
     * Make bar size.
     * @param {number} groupSize bar group size
     * @param {number} barGutter bar padding
     * @param {number} itemCount group item count
     * @returns {number} bar size (width or height)
     * @private
     */
    _makeBarSize: function(groupSize, barGutter, itemCount) {
        return (groupSize - (barGutter * (itemCount - 1))) / (itemCount + 1);
    },

    /**
     * Make option size.
     * @param {number} barSize bar size
     * @param {?number} optionBarWidth barWidth option
     * @returns {number} option size
     * @private
     */
    _makeOptionSize: function(barSize, optionBarWidth) {
        var optionsSize = 0;
        if (optionBarWidth) {
            optionsSize = tui.util.min([barSize, optionBarWidth]);
        }
        return optionsSize;
    },

    /**
     * Make addition padding.
     * @param {number} barSize bar size
     * @param {number} optionSize option size
     * @param {number} itemCount item count
     * @returns {number} addition padding
     * @private
     */
    _makeAdditionPadding: function(barSize, optionSize, itemCount) {
        var padding = 0;

        if (optionSize && optionSize < barSize) {
            padding = (barSize - optionSize) * itemCount / 2;
        }

        return (barSize / 2) + padding;
    },

    /**
     * Make base info for normal chart bounds.
     * @param {{width: number, height: number}} dimension series dimension
     * @param {string} sizeType size type (width or height)
     * @param {string} anotherSizeType another size type (width or height)
     * @returns {{
     *      dimension: {width: number, height: number},
     *      groupValues: Array.<Array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} base info
     * @private
     */
    _makeBaseInfoForNormalChartBounds: function(dimension, sizeType, anotherSizeType) {
        var groupValues = this._getPercentValues(),
            groupSize = dimension[anotherSizeType] / groupValues.length,
            itemCount = groupValues[0] && groupValues[0].length || 0,
            barGutter = this._makeBarGutter(groupSize, itemCount),
            barSize = this._makeBarSize(groupSize, barGutter, itemCount),
            optionSize = this._makeOptionSize(barSize, this.options.barWidth),
            additionPadding = this._makeAdditionPadding(barSize, optionSize, itemCount),
            limitDistance = this._getLimitDistanceFromZeroPoint(dimension[sizeType], this.data.limit);

        barSize = optionSize || barSize;

        return {
            dimension: dimension,
            groupSize: groupSize,
            barSize: barSize,
            additionPadding: additionPadding,
            step: barSize + barGutter,
            distance: limitDistance,
            isMinus: this.data.limit.min < 0 && this.data.limit.max <= 0
        };
    },

    /**
     * Make normal bounds.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupValues: Array.<Array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} baseInfo base info
     * @param {function} iteratee iteratee
     * @returns {Array} bounds
     * @private
     */
    _makeNormalBounds: function(baseInfo, iteratee) {
        return tui.util.map(this._getPercentValues(), function(values, groupIndex) {
            var padding = (baseInfo.groupSize * groupIndex) + baseInfo.additionPadding;
            return tui.util.map(values, function (value, index) {
                return iteratee(baseInfo, value, padding, index);
            }, this);
        }, this);
    },

    /**
     * Make base info for stacked chart bounds.
     * @param {{width: number, height: number}} dimension dimension
     * @param {string} sizeType size type (width or height)
     * @returns {{groupSize: (number), baseBound: object, additionPadding: number, dimensionSize: number, positionType: string, baseEndPosition: number}} base info
     * @private
     */
    _makeBaseInfoForStackedChartBounds: function(dimension, sizeType) {
        var limitDistance = this._getLimitDistanceFromZeroPoint(dimension[sizeType], this.data.limit),
            baseBound = {},
            groupSize, barWidth, optionWidth, additionPadding,
            anotherSizeType, positionTop, baseEndPosition;

        if (sizeType === 'height') {
            anotherSizeType = 'width';
            positionTop = 'left';
            baseEndPosition = -chartConst.SERIES_EXPAND_SIZE;
        } else {
            anotherSizeType = 'height';
            positionTop = 'top';
            baseEndPosition = chartConst.SERIES_EXPAND_SIZE;
        }

        groupSize = (dimension[anotherSizeType] / this._getPercentValues().length);
        barWidth = groupSize / 2;
        optionWidth = this._makeOptionSize(barWidth, this.options.barWidth);
        additionPadding = this._makeAdditionPadding(barWidth, optionWidth, 1);
        baseBound[anotherSizeType] = optionWidth || barWidth;

        return {
            groupSize: groupSize,
            baseBound: baseBound,
            additionPadding: additionPadding + chartConst.SERIES_EXPAND_SIZE,
            dimensionSize: dimension[sizeType],
            positionType: positionTop,
            baseEndPosition: baseEndPosition,
            distance: limitDistance
        };
    },

    /**
     * Make bounds of stacked column chart.
     * @param {{width: number, height:number}} dimension column chart dimension
     * @param {{groupSize: (number), baseBound: object, additionPadding: number, dimensionSize: number, positionType: string, baseEndPosition: number}} baseInfo base info
     * @param {function} makeBoundFunc make bound function
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeStackedBounds: function(dimension, baseInfo, makeBoundFunc) {
        var bounds = tui.util.map(this._getPercentValues(), function(values, groupIndex) {
            var padding = (baseInfo.groupSize * groupIndex) + baseInfo.additionPadding,
                endPlusPosition = baseInfo.baseEndPosition,
                endMinusPosition = baseInfo.baseEndPosition;

            return tui.util.map(values, function (value) {
                var bound = null,
                    endSize = Math.abs(value * baseInfo.dimensionSize);
                baseInfo.baseBound[baseInfo.positionType] = padding;

                if (value >= 0) {
                    bound = makeBoundFunc(baseInfo.baseBound, endSize, endPlusPosition);
                    endPlusPosition += endSize;
                } else {
                    endMinusPosition -= endSize;
                    bound = makeBoundFunc(baseInfo.baseBound, endSize, endMinusPosition);
                }

                return bound;
            }, this);
        }, this);

        return bounds;
    },

    /**
     * Render normal series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(elSeriesLabelArea) {
        var groupBounds = this.seriesData.groupBounds,
            firstFormattedValue = this.dataProcessor.getFirstFormattedValue(this.chartType),
            labelHeight = renderUtil.getRenderedLabelHeight(firstFormattedValue, this.theme.label),
            html;

        html = tui.util.map(this.dataProcessor.getGroupValues(this.chartType), function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var bound, formattedValue, renderingPosition;
                bound = groupBounds[groupIndex][index].end;
                formattedValue = this.dataProcessor.getFormattedValue(groupIndex, index, this.chartType);
                renderingPosition = this.makeSeriesRenderingPosition({
                    value: value,
                    bound: bound,
                    formattedValue: formattedValue,
                    labelHeight: labelHeight
                });
                return this._makeSeriesLabelHtml(renderingPosition, formattedValue, groupIndex, index);
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Make sum values.
     * @param {Array.<number>} values values
     * @returns {number} sum result.
     */
    _makeSumValues: function(values) {
        var sum = tui.util.sum(values);

        return renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
    },

    /**
     * Make stacked label position.
     * @param {{width: number, height: number, left: number, top: number}} bound element bound
     * @param {string} formattedValue formatted value
     * @param {number} labelHeight label height
     * @returns {{left: number, top: number}} position
     * @private
     */
    _makeStackedLabelPosition: function(bound, formattedValue, labelHeight) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);

        return {
            left: left,
            top: top
        };
    },

    /**
     * Make stacked labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {Array.<object>} params.bounds bounds,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var values = params.values,
            labelHeight = params.labelHeight,
            htmls, plusBound, minusBound;

        htmls = tui.util.map(values, function(value, index) {
            var bound = params.bounds[index],
                labelHtml = '',
                boundEnd, formattedValue, position;

            if (bound && value) {
                boundEnd = bound.end;
                formattedValue = this.dataProcessor.getFormattedValue(params.groupIndex, index, this.chartType);
                position = this._makeStackedLabelPosition(boundEnd, formattedValue, params.labelHeight);
                labelHtml = this._makeSeriesLabelHtml(position, formattedValue, params.groupIndex, index);
            }

            if (value > 0) {
                plusBound = boundEnd;
            } else if (value < 0) {
                minusBound = boundEnd;
            }

            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal') {
            htmls.push(this._makePlusSumLabelHtml(values, plusBound, labelHeight));
            htmls.push(this._makeMinusSumLabelHtml(values, minusBound, labelHeight));
        }

        return htmls.join('');
    },

    /**
     * Render stacked series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderStackedSeriesLabel: function(elSeriesLabelArea) {
        var groupBounds = this.seriesData.groupBounds,
            groupValues = this.dataProcessor.getGroupValues(this.chartType),
            firstFormattedValue = this.dataProcessor.getFirstFormattedValue(this.chartType),
            labelHeight = renderUtil.getRenderedLabelHeight(firstFormattedValue, this.theme.label),
            html;

        html = tui.util.map(groupValues, function(values, index) {
            var labelsHtml = this._makeStackedLabelsHtml({
                groupIndex: index,
                values: values,
                bounds: groupBounds[index],
                labelHeight: labelHeight
            });
            return labelsHtml;
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Render series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(elSeriesLabelArea) {
        if (this.options.stacked) {
            this._renderStackedSeriesLabel(elSeriesLabelArea);
        } else {
            this._renderNormalSeriesLabel(elSeriesLabelArea);
        }
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;
