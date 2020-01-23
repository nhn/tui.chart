/**
 * @fileoverview Calculator for dimension of legend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
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
  _calculateLegendsWidth(labels, labelTheme, checkboxWidth, maxWidth) {
    const restWidth = calculator.sum([
      LEGEND_AREA_H_PADDING,
      checkboxWidth,
      LEGEND_ICON_WIDTH,
      LEGEND_LABEL_LEFT_PADDING
    ]);

    return labels.map(label => {
      let labelWidth = renderUtil.getRenderedLabelWidth(label, labelTheme);

      if (maxWidth && labelWidth > maxWidth) {
        labelWidth = maxWidth;
      }
      labelWidth += restWidth;

      return labelWidth + LEGEND_H_LABEL_RIGHT_PADDING;
    });
  },

  /**
   * Divide legend labels.
   * @param {Array.<string>} labels legend labels
   * @param {number} maxRowCount division limit count
   * @returns {Array.<Array.<string>>}
   * @private
   */
  _divideLegendLabels(labels, maxRowCount) {
    const results = [];
    let temp = [];

    labels.forEach(label => {
      if (temp.length < maxRowCount) {
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
  _getLegendWidthInfo(dividedLabels, labelTheme, checkboxWidth, maxWidth) {
    let labelWidthArr = [];
    const legendWidths = dividedLabels.map(labels => {
      const legendLabelWidthArr = this._calculateLegendsWidth(
        labels,
        labelTheme,
        checkboxWidth,
        maxWidth
      );
      let legendWidth = calculator.sum(legendLabelWidthArr);

      labelWidthArr = labelWidthArr.concat(legendLabelWidthArr);
      legendWidth = legendWidth - LEGEND_H_LABEL_RIGHT_PADDING + LEGEND_AREA_H_PADDING;

      return legendWidth;
    });

    return {
      labelWidthArr,
      legendWidths
    };
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
    let maxRowCount = Number.MAX_VALUE;
    let divideCount = 1;
    let maxLineWidth = 0;
    let dividedLabels, lineWidths, labelWidths;
    do {
      maxRowCount = Math.round(labels.length / divideCount);
      dividedLabels = this._divideLegendLabels(labels, maxRowCount);
      const legendWidthInfo = this._getLegendWidthInfo(
        dividedLabels,
        labelTheme,
        checkboxWidth,
        maxWidth
      );

      ({ legendWidths: lineWidths, labelWidthArr: labelWidths } = legendWidthInfo);

      maxLineWidth = arrayUtil.max(lineWidths);

      if (maxRowCount === 1) {
        break;
      }

      divideCount += 1;
    } while (maxLineWidth >= chartWidth);

    maxLineWidth = Math.min(maxLineWidth, chartWidth);

    return {
      labels: this._optimizedHorizontalLegendLabels(labels, labelWidths, maxLineWidth),
      maxLineWidth
    };
  },

  /**
   * Make space optimized legend labels
   * @param {Array.<string>} labels - labels string
   * @param {Array.<number>} labelWidths - labels width
   * @param {number} maxLineWidth - max line width
   * @returns {Array.<Array.<string>>}
   * @private
   */
  _optimizedHorizontalLegendLabels(labels, labelWidths, maxLineWidth) {
    const optimizedDvidedLabels = [];
    const labelsLastIdx = labels.length - 1;
    let sum = 0;
    let temp = [];

    labels.forEach((label, labelIdx) => {
      const labelWidth = labelWidths[labelIdx];
      const paddingWidth = LEGEND_AREA_H_PADDING - LEGEND_H_LABEL_RIGHT_PADDING;
      const predictedLineWidth = sum + labelWidth + paddingWidth;

      if (predictedLineWidth <= maxLineWidth) {
        temp.push(label);
      } else {
        optimizedDvidedLabels.push(temp);
        temp = [label];
        sum = 0;
      }

      sum += labelWidth;

      if (labelsLastIdx === labelIdx) {
        optimizedDvidedLabels.push(temp);
      }
    });

    return optimizedDvidedLabels;
  },

  /**
   * Calculate height of horizontal legend.
   * @param {Array.<Array.<string>>} dividedLabels - divided labels
   * @param {{fontSize: number, fontFamily: number}} labelTheme - label theme for legend
   * @returns {number}
   * @private
   */
  _calculateHorizontalLegendHeight(dividedLabels, labelTheme) {
    const heightByLabel = Math.max.apply(
      null,
      dividedLabels.map(labels => renderUtil.getRenderedLabelsMaxHeight(labels, labelTheme))
    );
    const labelItemHeightWithPaddingTop = calculator.sum([
      Math.max(chartConst.LEGEND_CHECKBOX_SIZE, heightByLabel),
      chartConst.LINE_MARGIN_TOP
    ]);

    const legendHeight =
      labelItemHeightWithPaddingTop * dividedLabels.length -
      chartConst.LINE_MARGIN_TOP +
      chartConst.SERIES_AREA_V_PADDING;

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
      legendLabels,
      chartWidth,
      labelTheme,
      checkboxWidth,
      maxWidth
    );
    const horizontalLegendHeight = this._calculateHorizontalLegendHeight(
      dividedInfo.labels,
      labelTheme
    );
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
      LEGEND_AREA_H_PADDING * 2,
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
    const checkboxWidth =
      options.showCheckbox === false ? 0 : LEGEND_CHECKBOX_SIZE + LEGEND_LABEL_LEFT_PADDING;
    const { maxWidth } = options;
    let dimension = {};

    if (!options.visible) {
      dimension.width = 0;
    } else if (predicate.isHorizontalLegend(options.align)) {
      dimension = this._makeHorizontalDimension(
        labelTheme,
        legendLabels,
        chartWidth,
        checkboxWidth,
        maxWidth
      );
    } else {
      dimension = this._makeVerticalDimension(labelTheme, legendLabels, checkboxWidth, maxWidth);
    }

    return dimension;
  }
};
