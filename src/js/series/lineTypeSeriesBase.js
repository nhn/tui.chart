/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * Make positions of line chart.
     * @returns {Array.<Array.<object>>} positions
     * @private
     */
    _makeBasicPositions: function() {
        var dimension = this.boundsMaker.getDimension('series'),
            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),
            width = dimension.width,
            height = dimension.height,
            len = seriesDataModel.getGroupCount(),
            start = chartConst.SERIES_EXPAND_SIZE,
            step;

        if (this.data.aligned) {
            step = width / (len - 1);
        } else {
            step = width / len;
            start += (step / 2);
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem, index) {
                var position = {
                    left: start + (step * index),
                    top: height - (seriesItem.ratio * height) + chartConst.SERIES_EXPAND_SIZE
                };

                if (tui.util.isExisty(seriesItem.startRatio)) {
                    position.startTop = height - (seriesItem.startRatio * height) + chartConst.SERIES_EXPAND_SIZE;
                }

                return position;
            });
        }, true);
    },

    /**
     * Calculate label position top.
     * @param {{top: number, startTop: number}} basePosition - base position
     * @param {number} value - value of seriesItem
     * @param {number} labelHeight - label height
     * @param {boolean} isStart - whether start value of seriesItem or not
     * @returns {number} position top
     * @private
     */
    _calculateLabelPositionTop: function(basePosition, value, labelHeight, isStart) {
        var baseTop = basePosition.top,
            top;

        if (predicate.isValidStackedOption(this.options.stacked)) {
            top = (basePosition.startTop + baseTop - labelHeight) / 2 + 1;
        } else if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            top = baseTop - labelHeight - chartConst.SERIES_LABEL_PADDING;
        } else {
            top = baseTop + chartConst.SERIES_LABEL_PADDING;
        }

        return top;
    },

    /**
     * Make label position for rendering label of series area.
     * @param {{left: number, top: number, startTop: ?number}} basePosition - base position for calculating
     * @param {number} labelHeight - label height
     * @param {(string | number)} label - label of seriesItem
     * @param {number} value - value of seriesItem
     * @param {boolean} isStart - whether start label position or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makeLabelPosition: function(basePosition, labelHeight, label, value, isStart) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);

        return {
            left: basePosition.left - (labelWidth / 2),
            top: this._calculateLabelPositionTop(basePosition, value, labelHeight, isStart)
        };
    },

    /**
     * Make html for series label for line type chart.
     * @param {number} groupIndex - index of seriesDataModel.groups
     * @param {number} index - index of seriesGroup.items
     * @param {SeriesItem} seriesItem - series item
     * @param {number} labelHeight - label height
     * @param {boolean} isStart - whether start label position or not
     * @returns {string}
     * @private
     */
    _makeSeriesLabelHtmlForLineType: function(groupIndex, index, seriesItem, labelHeight, isStart) {
        var basePosition = tui.util.extend({}, this.seriesData.groupPositions[groupIndex][index]),
            label, position;

        if (isStart) {
            label = seriesItem.startLabel;
            basePosition.top = basePosition.startTop;
        } else {
            label = seriesItem.endLabel;
        }

        position = this._makeLabelPosition(basePosition, labelHeight, label, seriesItem.value, isStart);

        return this._makeSeriesLabelHtml(position, label, groupIndex);
    },

    /**
     * Render series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(elSeriesLabelArea) {
        var self = this,
            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),
            firstLabel = seriesDataModel.getFirstItemLabel(),
            labelHeight = renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label),
            htmls;

        htmls = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var labelHtml = self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight);

                if (seriesItem.isRange) {
                    labelHtml += self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight, true);
                }

                return labelHtml;
            }).join('');
        }, true);

        elSeriesLabelArea.innerHTML = htmls.join('');
    },

    /**
     * Whether changed or not.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(groupIndex, index) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = {
            groupIndex: groupIndex,
            index: index
        };

        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);
    },

    /**
     * To call showGroupTooltipLine function of graphRenderer.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupTooltipLine: function(bound) {
        if (!this.graphRenderer.showGroupTooltipLine) {
            return;
        }
        this.graphRenderer.showGroupTooltipLine(bound);
    },

    /**
     * To call hideGroupTooltipLine function of graphRenderer.
     */
    onHideGroupTooltipLine: function() {
        if (!this.graphRenderer.hideGroupTooltipLine) {
            return;
        }
        this.graphRenderer.hideGroupTooltipLine();
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;
