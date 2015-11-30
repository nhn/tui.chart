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
     * To make series data.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound series bound
     * @returns {object} add data
     */
    makeSeriesData: function(bound) {
        var groupBounds = this._makeBounds(bound.dimension);

        this.groupBounds = groupBounds;

        return {
            groupBounds: groupBounds,
            groupValues: this.percentValues
        };
    },

    /**
     * To make bar gutter.
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
     * To make bar size.
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
     * To make option size.
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
     * To make addition padding.
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
     * To make base info for normal chart bounds.
     * @param {{width: number, height: number}} dimension series dimension
     * @param {string} sizeType size type (width or height)
     * @param {string} anotherSizeType another size type (width or height)
     * @returns {{
     *      dimension: {width: number, height: number},
     *      groupValues: array.<array.<number>>,
     *      groupSize: number, barSize: number, step: number,
     *      distanceToMin: number, isMinus: boolean
     * }} base info
     */
    makeBaseInfoForNormalChartBounds: function(dimension, sizeType, anotherSizeType) {
        var groupValues = this.percentValues,
            groupSize = dimension[anotherSizeType] / groupValues.length,
            itemCount = groupValues[0] && groupValues[0].length || 0,
            barGutter = this._makeBarGutter(groupSize, itemCount),
            barSize = this._makeBarSize(groupSize, barGutter, itemCount),
            optionSize = this._makeOptionSize(barSize, this.options.barWidth),
            additionPadding = this._makeAdditionPadding(barSize, optionSize, itemCount),
            limitDistance = this.getLimitDistanceFromZeroPoint(dimension[sizeType], this.data.limit);

        barSize = optionSize || barSize;

        return {
            dimension: dimension,
            groupValues: groupValues,
            groupSize: groupSize,
            barSize: barSize,
            additionPadding: additionPadding,
            step: barSize + barGutter,
            distanceToMin: limitDistance.toMin,
            isMinus: this.data.limit.min < 0 && this.data.limit.max <= 0
        };
    },

    /**
     * Render normal series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(params, elSeriesLabelArea) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;

        html = tui.util.map(params.values, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var bound, formattedValue, renderingPosition;
                bound = groupBounds[groupIndex][index].end;
                formattedValue = formattedValues[groupIndex][index];
                renderingPosition = this.makeSeriesRenderingPosition({
                    value: value,
                    bound: bound,
                    formattedValue: formattedValue,
                    labelHeight: labelHeight
                });
                return this.makeSeriesLabelHtml(renderingPosition, formattedValue, groupIndex, index);
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * To make sum values.
     * @param {array.<number>} values values
     * @param {array.<function>} formatFunctions format functions
     * @returns {number} sum result.
     */
    makeSumValues: function(values, formatFunctions) {
        var sum = tui.util.sum(tui.util.filter(values, function(value) {
                return value > 0;
            })),
            fns = [sum].concat(formatFunctions || []);

        return tui.util.reduce(fns, function(stored, fn) {
            return fn(stored);
        });
    },

    /**
     * To make stacked labels html.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {array.<number>} params.values values,
     *      @param {array.<function>} params.formatFunctions formatting functions,
     *      @param {array.<object>} params.bounds bounds,
     *      @param {array} params.formattedValues formatted values,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var values = params.values,
            bound, htmls;

        htmls = tui.util.map(values, function(value, index) {
            var labelWidth, left, top, labelHtml, formattedValue;

            if (value < 0) {
                return '';
            }

            bound = params.bounds[index].end;
            formattedValue = params.formattedValues[index];
            labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label);
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
            top = bound.top + ((bound.height - params.labelHeight + chartConst.TEXT_PADDING) / 2);
            labelHtml = this.makeSeriesLabelHtml({
                left: left,
                top: top
            }, formattedValue, params.groupIndex, index);
            return labelHtml;
        }, this);

        if (this.options.stacked === 'normal' && bound) {
            htmls.push(this.makeSumLabelHtml({
                values: values,
                formatFunctions: params.formatFunctions,
                bound: bound,
                labelHeight: params.labelHeight
            }));
        }
        return htmls.join('');
    },

    /**
     * Render stacked series label.
     * @param {object} params parameters
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderStackedSeriesLabel: function(params, elSeriesLabelArea) {
        var groupBounds = params.groupBounds,
            formattedValues = params.formattedValues,
            formatFunctions = params.formatFunctions || [],
            labelHeight = renderUtil.getRenderedLabelHeight(formattedValues[0][0], this.theme.label),
            html;

        html = tui.util.map(params.values, function(values, index) {
            var labelsHtml = this._makeStackedLabelsHtml({
                groupIndex: index,
                values: values,
                formatFunctions: formatFunctions,
                bounds: groupBounds[index],
                formattedValues: formattedValues[index],
                labelHeight: labelHeight
            });
            return labelsHtml;
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {array.<array>} params.groupBounds group bounds
     *      @param {array.<array>} params.formattedValues formatted values
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(params, elSeriesLabelArea) {
        if (!this.options.showLabel) {
            return;
        }

        if (this.options.stacked) {
            this._renderStackedSeriesLabel(params, elSeriesLabelArea);
        } else {
            this._renderNormalSeriesLabel(params, elSeriesLabelArea);
        }
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        if (groupIndex === -1 || index === -1) {
            return null;
        }
        return this.groupBounds[groupIndex][index].end;
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;
