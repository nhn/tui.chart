/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
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
            itemGroup: this.dataProcessor.getItemGroup()
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
            standardSize = 6,
            gutter;

        if (baseSize <= 2) {
            gutter = 0;
        } else if (baseSize <= standardSize) {
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
     * Calculate difference between optionSize and barSize.
     * @param {number} barSize bar size
     * @param {number} optionSize option size
     * @param {number} itemCount item count
     * @returns {number} addition padding
     * @private
     */
    _calculateAdditionalPosition: function(barSize, optionSize, itemCount) {
        var additionalPosition = 0;

        if (optionSize && optionSize < barSize) {
            additionalPosition = (barSize / 2) + ((barSize - optionSize) * itemCount / 2);
        }

        return additionalPosition;
    },

    /**
     * Make base data for making bound.
     * @param {number} baseGroupSize base group size
     * @param {number} baseBarSize base bar size
     * @returns {{
     *      baseBarSize: number,
     *      groupSize: number,
     *      barSize: number,
     *      step: number,
     *      firstAdditionalPosition: number,
     *      additionalPosition: number,
     *      basePosition: number
     * }}
     * @private
     */
    _makeBaseDataForMakingBound: function(baseGroupSize, baseBarSize) {
        var isStacked = predicate.isValidStackedOption(this.options.stacked),
            itemGroup = this.dataProcessor.getItemGroup(),
            groupSize = baseGroupSize / itemGroup.getGroupCount(this.chartType),
            firstAdditionalPosition = 0,
            itemCount, barGutter, barSize, optionSize, additionalPosition, basePosition;

        if (!isStacked) {
            itemCount = itemGroup.getFirstItems(this.chartType).getItemCount();
        } else {
            itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount();
        }

        barGutter = this._makeBarGutter(groupSize, itemCount);
        barSize = this._makeBarSize(groupSize, barGutter, itemCount);
        optionSize = this._makeOptionSize(barSize, this.options.barWidth);
        additionalPosition = this._calculateAdditionalPosition(barSize, optionSize, itemCount);
        barSize = optionSize || barSize;
        basePosition = this._getLimitDistanceFromZeroPoint(baseBarSize, this.data.limit).toMin;

        if (predicate.isColumnChart(this.chartType)) {
            basePosition = baseBarSize - basePosition;
        }

        if (!this.options.barWidth || barSize < this.options.barWidth) {
            firstAdditionalPosition = (barSize / 2) + additionalPosition;
        }

        return {
            baseBarSize: baseBarSize,
            groupSize: groupSize,
            barSize: barSize,
            step: barGutter + barSize,
            firstAdditionalPosition: firstAdditionalPosition,
            additionalPosition: additionalPosition,
            basePosition: basePosition
        };
    },

    /**
     * Make html for series labels
     * @param {number} groupIndex index of groups
     * @param {number} labelHeight label height
     * @param {Item} item item
     * @param {number} index index of items
     * @returns {string}
     * @private
     */
    _makeSeriesLabelsHtml: function(groupIndex, labelHeight, item, index) {
        var bound = this.seriesData.groupBounds[groupIndex][index].end,
            position = this.makeSeriesRenderingPosition(bound, labelHeight, item.value, item.formattedEnd),
            labelHtml = this._makeSeriesLabelHtml(position, item.formattedEnd, index);

        if (item.isRange) {
            position = this.makeSeriesRenderingPosition(bound, labelHeight, item.value, item.formattedStart, true);
            labelHtml += this._makeSeriesLabelHtml(position, item.formattedStart, index);
        }

        return labelHtml;
    },

    /**
     * Render normal series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(elSeriesLabelArea) {
        var self = this,
            firstFormattedValue = this.dataProcessor.getFirstFormattedValue(this.chartType),
            labelHeight = renderUtil.getRenderedLabelHeight(firstFormattedValue, this.theme.label),
            itemGroup = this.dataProcessor.getItemGroup(),
            html;

        html = itemGroup.map(function(items, groupIndex) {
            var makeSeriesLabelsHtml = tui.util.bind(self._makeSeriesLabelsHtml, self, groupIndex, labelHeight);

            return items.map(makeSeriesLabelsHtml).join('');
        }, this.chartType).join('');

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
        var self = this,
            items = params.items,
            labelHeight = params.labelHeight,
            htmls, plusBound, minusBound, values;

        htmls = items.map(function(item, index) {
            var bound = params.bounds[index],
                labelHtml = '',
                boundEnd, position;

            if (bound && item) {
                boundEnd = bound.end;
                position = self._makeStackedLabelPosition(boundEnd, item.formattedValue, params.labelHeight);
                labelHtml = self._makeSeriesLabelHtml(position, item.formattedValue, index);
            }

            if (item.value > 0) {
                plusBound = boundEnd;
            } else if (item.value < 0) {
                minusBound = boundEnd;
            }

            return labelHtml;
        });

        if (this.options.stacked === 'normal') {
            values = items.pluck('value');
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
        var self = this,
            groupBounds = this.seriesData.groupBounds,
            itemGroup = this.dataProcessor.getItemGroup(),
            firstFormattedValue = this.dataProcessor.getFirstFormattedValue(this.chartType),
            labelHeight = renderUtil.getRenderedLabelHeight(firstFormattedValue, this.theme.label),
            html;

        html = itemGroup.map(function(items, index) {
            var labelsHtml = self._makeStackedLabelsHtml({
                groupIndex: index,
                items: items,
                bounds: groupBounds[index],
                labelHeight: labelHeight
            });
            return labelsHtml;
        }, this.chartType).join('');

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
