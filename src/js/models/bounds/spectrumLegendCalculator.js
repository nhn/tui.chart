/**
 * @fileoverview Calculator for spectrum legend.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import chartConst from '../../const';
import renderUtil from '../../helpers/renderUtil';
import calculator from '../../helpers/calculator';

/**
 * Calculator for spectrum legend.
 * @module spectrumLegendCalculator
 * @private */
const spectrumLegendCalculator = {
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
            (chartConst.MAP_LEGEND_TOOLTIP_HORIZONTAL_PADDING * 2),
            labelWidth,
            chartConst.MAP_LEGEND_WEDGE_SIZE
        ]);

        return {
            width: calculator.sum([
                chartConst.MAP_LEGEND_AREA_PADDING_WIDE,
                tooltipWidth,
                chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE,
                chartConst.MAP_LEGEND_GRAPH_SIZE,
                chartConst.MAP_LEGEND_LABEL_PADDING,
                Math.max(maxValueLabelWidth, minValueLabelWidth)
            ]),
            height: chartConst.VERTICAL_MAP_LEGEND_HEIGHT
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
            (chartConst.MAP_LEGEND_TOOLTIP_VERTICAL_PADDING * 2),
            labelHeight,
            chartConst.MAP_LEGEND_WEDGE_SIZE
        ]);
        const padding = isBoxType ? chartConst.MAP_LEGEND_AREA_PADDING_NARROW : chartConst.MAP_LEGEND_AREA_PADDING_WIDE;
        const additionalTopPadding = isTopLegend ? chartConst.MAP_LEGEND_AREA_PADDING_WIDE : 0;

        return {
            width: chartConst.HORIZONTAL_MAP_LEGEND_WIDTH,
            height: calculator.sum([
                padding,
                tooltipHeight,
                chartConst.MAP_LEGEND_PADDING_BTW_GRAPH_AND_WEDGE,
                chartConst.MAP_LEGEND_GRAPH_SIZE,
                chartConst.MAP_LEGEND_LABEL_PADDING,
                labelHeight,
                chartConst.MAP_LEGEND_LABEL_PADDING,
                additionalTopPadding
            ])
        };
    }
};

export default spectrumLegendCalculator;
