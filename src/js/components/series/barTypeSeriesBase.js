/**
 * @fileoverview BarTypeSeriesBase is base class for bar type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var labelHelper = require('./renderingLabelHelper');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {object} add data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        this.groupBounds = this._makeBounds(this.layout.dimension);

        return {
            groupBounds: this.groupBounds,
            seriesDataModel: this._getSeriesDataModel()
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
        var baseSize = groupSize / (itemCount + 1) / 2;
        var standardSize = 6;
        var gutter;

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
     * Calculate bar size.
     * @param {number} groupSize bar group size
     * @param {number} barGutter bar padding
     * @param {number} itemCount group item count
     * @returns {number} bar size (width or height)
     * @private
     */
    _calculateBarSize: function(groupSize, barGutter, itemCount) {
        return (groupSize - (barGutter * (itemCount - 1))) / (itemCount + 1);
    },

    /**
     * Get bar width option size.
     * @param {number} barSize bar size
     * @param {?number} optionBarWidth barWidth option
     * @returns {number} option size
     * @private
     */
    _getBarWidthOptionSize: function(barSize, optionBarWidth) {
        var optionsSize = 0;

        if (optionBarWidth) {
            optionsSize = Math.min(barSize, optionBarWidth);
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
        var isStackType = predicate.isValidStackOption(this.options.stackType);
        var seriesDataModel = this._getSeriesDataModel();
        var groupSize = baseGroupSize / seriesDataModel.getGroupCount();
        var firstAdditionalPosition = 0;
        var itemCount, barGutter, barSize, optionSize, additionalPosition, basePosition;

        if (!isStackType) {
            itemCount = seriesDataModel.getFirstSeriesGroup().getSeriesItemCount();
        } else {
            itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount();
        }

        barGutter = this._makeBarGutter(groupSize, itemCount);
        barSize = this._calculateBarSize(groupSize, barGutter, itemCount);
        optionSize = this._getBarWidthOptionSize(barSize, this.options.barWidth);
        additionalPosition = this._calculateAdditionalPosition(barSize, optionSize, itemCount);
        barSize = optionSize || barSize;
        basePosition = this._getLimitDistanceFromZeroPoint(baseBarSize, this.limit).toMin;

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
     * Render normal series label.
     * @param {HTMLElement} labelContainer series label area element
     * @private
     */
    _renderNormalSeriesLabel: function(labelContainer) {
        var sdm = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var positionsSet, html;

        if (predicate.isBarChart(this.chartType)) {
            positionsSet = labelHelper.boundsToLabelPositionsForBarChart(sdm, boundsSet, labelTheme);
        } else {
            positionsSet = labelHelper.boundsToLabelPositionsForColumnChart(sdm, boundsSet, labelTheme);
        }

        html = labelHelper.makeLabelsHtmlForBoundType(sdm, positionsSet, labelTheme, selectedIndex);

        labelContainer.innerHTML = html;
    },

    /**
     * Make sum values.
     * @param {Array.<number>} values values
     * @returns {number} sum result.
     */
    _makeSumValues: function(values) {
        var sum = calculator.sum(values);

        return renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions(), this.chartType, 'seires');
    },

    /**
     * Make stackType label position.
     * @param {{width: number, height: number, left: number, top: number}} bound element bound
     * @param {string} label label
     * @param {number} labelHeight label height
     * @returns {{left: number, top: number}} position
     * @private
     */
    _makeStackedLabelPosition: function(bound, label, labelHeight) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label),
            left = bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2),
            top = bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);

        return {
            left: left,
            top: top
        };
    },

    /**
     * Make labels html, when has stackType option.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {Array.<object>} params.bounds bounds,
     *      @param {number} params.labelHeight label height
     * @returns {string} labels html
     * @private
     */
    _makeStackedLabelsHtml: function(params) {
        var self = this,
            seriesGroup = params.seriesGroup,
            labelHeight = params.labelHeight,
            htmls, plusBound, minusBound, values;

        htmls = seriesGroup.map(function(seriesItem, index) {
            var bound = params.bounds[index],
                labelHtml = '',
                boundEnd, position;

            if (bound && seriesItem) {
                boundEnd = bound.end;
                position = self._makeStackedLabelPosition(boundEnd, seriesItem.label, params.labelHeight);
                labelHtml = self._makeSeriesLabelHtml(position, seriesItem.label, index);
            }

            if (seriesItem.value > 0) {
                plusBound = boundEnd;
            } else if (seriesItem.value < 0) {
                minusBound = boundEnd;
            }

            return labelHtml;
        });

        if (predicate.isNormalStack(this.options.stackType)) {
            values = seriesGroup.pluck('value');
            htmls.push(this._makePlusSumLabelHtml(values, plusBound, labelHeight));
            htmls.push(this._makeMinusSumLabelHtml(values, minusBound, labelHeight));
        }

        return htmls.join('');
    },

    /**
     * Render series label, when has stackType option.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderStackedSeriesLabel: function(elSeriesLabelArea) {
        var self = this;
        var groupBounds = this.seriesData.groupBounds;
        var seriesDataModel = this._getSeriesDataModel();
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, this.theme.label);
        var html = seriesDataModel.map(function(seriesGroup, index) {
            var labelsHtml = self._makeStackedLabelsHtml({
                groupIndex: index,
                seriesGroup: seriesGroup,
                bounds: groupBounds[index],
                labelHeight: labelHeight
            });

            return labelsHtml;
        }).join('');

        elSeriesLabelArea.innerHTML = html;
    },

    /**
     * Render series label.
     * @param {HTMLElement} labelContainer series label area element
     * @private
     */
    _renderSeriesLabel: function(labelContainer) {
        if (this.options.stackType) {
            this._renderStackedSeriesLabel(labelContainer);
        } else {
            this._renderNormalSeriesLabel(labelContainer);
        }
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;
