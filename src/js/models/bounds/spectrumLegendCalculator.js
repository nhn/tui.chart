/**
 * @fileoverview Calculator for spectrum legend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import renderUtil from '../../helpers/renderUtil';
import calculator from '../../helpers/calculator';
const {
  MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING,
  MAP_LEGEND_WEDGE_SIZE,
  MAP_LEGEND_AREA_PADDING_WIDE,
  MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE,
  MAP_LEGEND_GRAPH_SIZE,
  MAP_LEGEND_LABEL_PADDING,
  VERTICAL_MAP_LEGEND_HEIGHT,
  MAP_LEGEND_TOOLTIP_VERTICAL_PADDING,
  MAP_LEGEND_AREA_PADDING_NARROW,
  HORIZONTAL_MAP_LEGEND_WIDTH
} = chartConst;

/**
 * Calculator for spectrum legend.
 * @module spectrumLegendCalculator
 * @private
 */
export default {
  /**
   * Make vertical dimension.
   * @param {string} maxValue - formatted max value
   * @param {string} minValue - formatted min value
   * @param {object} labelTheme - theme for label
   * @returns {{width: number, height: number}}
   * @private
   */
  _makeVerticalDimension(maxValue, minValue, labelTheme) {
    const maxValueLabelWidth = renderUtil.getRenderedLabelWidth(maxValue, labelTheme);
    const minValueLabelWidth = renderUtil.getRenderedLabelWidth(minValue, labelTheme);
    const labelWidth = renderUtil.getRenderedLabelWidth(maxValue, labelTheme);
    const tooltipWidth = calculator.sum([
      MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2,
      labelWidth,
      MAP_LEGEND_WEDGE_SIZE
    ]);

    return {
      width: calculator.sum([
        MAP_LEGEND_AREA_PADDING_WIDE,
        tooltipWidth,
        MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE,
        MAP_LEGEND_GRAPH_SIZE,
        MAP_LEGEND_LABEL_PADDING,
        Math.max(maxValueLabelWidth, minValueLabelWidth)
      ]),
      height: VERTICAL_MAP_LEGEND_HEIGHT
    };
  },

  /**
   * Make horizontal dimension.
   * @param {string} maxValue - formatted max value
   * @param {object} labelTheme - theme for label
   * @param {boolean} isBoxType - whether use narrow padding or not
   * @param {boolean} isTopLegend - whether use top legend or not
   * @returns {{width: number, height: number}}
   * @private
   */
  _makeHorizontalDimension(maxValue, labelTheme, isBoxType, isTopLegend) {
    const labelHeight = renderUtil.getRenderedLabelHeight(maxValue, labelTheme);
    const tooltipHeight = calculator.sum([
      MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2,
      labelHeight,
      MAP_LEGEND_WEDGE_SIZE
    ]);
    const padding = isBoxType ? MAP_LEGEND_AREA_PADDING_NARROW : MAP_LEGEND_AREA_PADDING_WIDE;
    const additionalTopPadding = isTopLegend ? MAP_LEGEND_AREA_PADDING_WIDE : 0;

    return {
      width: HORIZONTAL_MAP_LEGEND_WIDTH,
      height: calculator.sum([
        padding,
        tooltipHeight,
        MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE,
        MAP_LEGEND_GRAPH_SIZE,
        MAP_LEGEND_LABEL_PADDING,
        labelHeight,
        MAP_LEGEND_LABEL_PADDING,
        additionalTopPadding
      ])
    };
  }
};
