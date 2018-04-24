/**
 * @fileoverview Calculator for dimension of legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import arrayUtil from '../../helpers/arrayUtil';

const {
    LEGEND_CHECKBOX_SIZE,
    LEGEND_ICON_WIDTH,
    LEGEND_LABEL_LEFT_PADDING,
    LEGEND_V_LABEL_RIGHT_PADDING,
    LEGEND_H_LABEL_RIGHT_PADDING,
    LEGEND_AREA_H_PADDING
} = chartConst;

/**
 * Calculator for dimension of legend.
 * @module legendCalculator
 * @private */
export default {
    /**
     * Calculate sum of legends width.
     * @param {Array.<string>} labels - legend labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme - legend label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {number}
     * @private
     */
    _calculateLegendsWidthSum(labels, labelTheme, checkboxWidth, maxWidth) {
        const restWidth = calculator.sum([
            LEGEND_AREA_H_PADDING,
            checkboxWidth,
            LEGEND_ICON_WIDTH,
            LEGEND_LABEL_LEFT_PADDING
        ]);

        let legendWidth = calculator.sum(labels.map(label => {
            let labelWidth = renderUtil.getRenderedLabelWidth(label, labelTheme);

            if (maxWidth && labelWidth > maxWidth) {
                labelWidth = maxWidth;
            }
            labelWidth += restWidth;

            return labelWidth + LEGEND_H_LABEL_RIGHT_PADDING;
        }));

        legendWidth = legendWidth - LEGEND_H_LABEL_RIGHT_PADDING + LEGEND_AREA_H_PADDING;

        return legendWidth;
    },

    /**
     * Divide legend labels.
     * @param {Array.<string>} labels legend labels
     * @param {number} count division count
     * @returns {Array.<Array.<string>>}
     * @private
     */
    _divideLegendLabels(labels, count) {
        const limitCount = Math.round(labels.length / count);
        const results = [];
        let temp = [];

        labels.forEach(label => {
            if (temp.length < limitCount) {
                temp.push(label);
            } else {
                results.push(temp);
                temp = [label];
            }
        });

        if (temp.length) {
            results.push(temp);
        }

        return results;
    },

    /**
     * Get max line width.
     * @param {Array.<string>} dividedLabels - divided labels
     * @param {{fontFamily: ?string, fontSize: ?string}} labelTheme - label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {number}
     * @private
     */
    _getMaxLineWidth(dividedLabels, labelTheme, checkboxWidth, maxWidth) {
        const lineWidths = dividedLabels.map(labels => (
            this._calculateLegendsWidthSum(labels, labelTheme, checkboxWidth, maxWidth)
        ));

        return arrayUtil.max(lineWidths);
    },

    /**
     * Make divided labels and max line width.
     * @param {Array.<string>} labels legend labels
     * @param {number} chartWidth chart width
     * @param {{fontSize: number, fontFamily: number}} labelTheme legend label theme
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{dividedLabels: Array.<Array.<string>>, maxLineWidth: number}}
     * @private
     */
    _makeDividedLabelsAndMaxLineWidth(labels, chartWidth, labelTheme, checkboxWidth, maxWidth) {
        let divideCount = 1;
        let maxLineWidth = 0;
        let prevMaxWidth = 0;
        let dividedLabels, prevLabels;

        do {
            dividedLabels = this._divideLegendLabels(labels, divideCount);
            maxLineWidth = this._getMaxLineWidth(dividedLabels, labelTheme, checkboxWidth, maxWidth);

            if (prevMaxWidth === maxLineWidth) {
                dividedLabels = prevLabels;
                break;
            }

            prevMaxWidth = maxLineWidth;
            prevLabels = dividedLabels;
            divideCount += 1;
        } while (maxLineWidth >= chartWidth);

        return {
            labels: dividedLabels,
            maxLineWidth
        };
    },

    /**
     * Calculate height of horizontal legend.
     * @param {Array.<Array.<string>>} dividedLabels - divided labels
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @returns {number}
     * @private
     */
    _calculateHorizontalLegendHeight(dividedLabels, labelTheme) {
        const heightByLabel = Math.max.apply(null, dividedLabels.map(labels => (
            renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme)
        )));
        const labelItemHeightWithPaddingTop = calculator.sum([
            Math.max(chartConst.LEGEND_CHECKBOX_SIZE, heightByLabel),
            chartConst.LINE_MARGIN_TOP
        ]);

        const legendHeight = ((labelItemHeightWithPaddingTop * dividedLabels.length) - chartConst.LINE_MARGIN_TOP
             + chartConst.SERIES_AREA_V_PADDING);

        return legendHeight;
    },

    /**
     * Make dimension of horizontal legend.
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} chartWidth - chart width
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{width: number, height: (number)}}
     * @private
     */
    _makeHorizontalDimension(labelTheme, legendLabels, chartWidth, checkboxWidth, maxWidth) {
        const dividedInfo = this._makeDividedLabelsAndMaxLineWidth(
            legendLabels, chartWidth, labelTheme, checkboxWidth, maxWidth
        );
        const horizontalLegendHeight = this._calculateHorizontalLegendHeight(dividedInfo.labels, labelTheme);
        const legendHeight = horizontalLegendHeight + chartConst.SERIES_AREA_V_PADDING;

        return {
            width: Math.max(dividedInfo.maxLineWidth, chartConst.MIN_LEGEND_WIDTH),
            height: legendHeight
        };
    },

    /**
     * Make dimension of vertical legend.
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} checkboxWidth - width for checkbox
     * @param {?number} [maxWidth] - user option legend maxWidth
     * @returns {{width: (number)}}
     * @private
     */
    _makeVerticalDimension(labelTheme, legendLabels, checkboxWidth, maxWidth) {
        let labelWidth = renderUtil.getRenderedLabelsMaxWidth(legendLabels, labelTheme);
        let legendWidth = 0;

        if (maxWidth && labelWidth > maxWidth) {
            labelWidth = maxWidth;
        }

        legendWidth = calculator.sum([
            (LEGEND_AREA_H_PADDING * 2),
            checkboxWidth,
            LEGEND_ICON_WIDTH,
            LEGEND_LABEL_LEFT_PADDING,
            labelWidth,
            LEGEND_V_LABEL_RIGHT_PADDING
        ]);

        return {
            width: legendWidth,
            height: 0
        };
    },

    /**
     * Calculate legend dimension.
     * @param {{showCheckbox: boolean, visible: boolean, align: string}} options - options for legend
     * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
     * @param {Array.<string>} legendLabels - labels for legend
     * @param {number} chartWidth chart width
     * @returns {{width: number, height: number}}
     */
    calculate(options, labelTheme, legendLabels, chartWidth) {
        const checkboxWidth = options.showCheckbox === false ? 0 : LEGEND_CHECKBOX_SIZE + LEGEND_LABEL_LEFT_PADDING;
        const {maxWidth} = options;
        let dimension = {};

        if (!options.visible) {
            dimension.width = 0;
        } else if (predicate.isHorizontalLegend(options.align)) {
            dimension = this._makeHorizontalDimension(
                labelTheme, legendLabels, chartWidth, checkboxWidth, maxWidth
            );
        } else {
            dimension = this._makeVerticalDimension(labelTheme, legendLabels, checkboxWidth, maxWidth);
        }

        return dimension;
    }
};
