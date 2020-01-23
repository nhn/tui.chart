/**
 * @fileoverview Predicate.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import arrayUtil from './arrayUtil';

/**
 * predicate.
 * @module predicate
 * @private */
const predicate = {
  /**
   * Whether bar chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isBarChart(chartType) {
    return chartType === chartConst.CHART_TYPE_BAR;
  },

  /**
   * Whether column chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isColumnChart(chartType) {
    return chartType === chartConst.CHART_TYPE_COLUMN;
  },

  /**
   * Whether bar type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isBarTypeChart(chartType) {
    return predicate.isBarChart(chartType) || predicate.isColumnChart(chartType);
  },

  /**
   * Whether column type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} seriesTypes - type of series
   * @returns {boolean}
   */
  isColumnTypeChart(chartType, seriesTypes) {
    return (
      predicate.isHeatmapChart(chartType) ||
      predicate.isColumnChart(chartType) ||
      predicate.isBoxplotChart(chartType) ||
      predicate.isLineColumnComboChart(chartType, seriesTypes)
    );
  },

  /**
   * Whether boxplot chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isBoxplotChart(chartType) {
    return chartType === chartConst.CHART_TYPE_BOXPLOT;
  },

  /**
   * Whether bullet chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isBulletChart(chartType) {
    return chartType === chartConst.CHART_TYPE_BULLET;
  },

  /**
   * Whether radial type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isRadialChart(chartType) {
    return chartType === chartConst.CHART_TYPE_RADIAL;
  },

  /**
   * Whether diverging chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {boolean} diverging - whether has diverging or not
   * @returns {*|boolean}
   */
  isDivergingChart(chartType, diverging) {
    return this.isBarTypeChart(chartType) && diverging;
  },

  /**
   * Whether normal stack chart or not.
   * @param {string} chartType - type of chart
   * @param {string} stackType - type of stack
   * @returns {boolean}
   * @private
   */
  isNormalStackChart(chartType, stackType) {
    const isAllowedStackOption = predicate.isAllowedStackOption(chartType);
    const isNormalStack = predicate.isNormalStack(stackType);

    return isAllowedStackOption && isNormalStack;
  },

  /**
   * Whether percent stack chart or not.
   * @param {string} chartType - type of chart
   * @param {string} stackType - type of stack
   * @returns {boolean}
   * @private
   */
  isPercentStackChart(chartType, stackType) {
    const isAllowedStackOption = predicate.isAllowedStackOption(chartType);
    const isPercentStack = predicate.isPercentStack(stackType);

    return isAllowedStackOption && isPercentStack;
  },

  /**
   * Whether combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isComboChart(chartType) {
    return chartType === chartConst.CHART_TYPE_COMBO;
  },

  /**
   * Whether line and column combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} subChartTypes - types of chart
   * @returns {boolean}
   */
  isLineColumnComboChart(chartType, subChartTypes) {
    const isLineOrColumn = arrayUtil.all(
      subChartTypes || [],
      subChartType => predicate.isLineChart(subChartType) || predicate.isColumnChart(subChartType)
    );

    return predicate.isComboChart(chartType) && isLineOrColumn;
  },

  /**
   * Whether pie and donut combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} subChartTypes - types of chart
   * @returns {boolean}
   */
  isPieDonutComboChart(chartType, subChartTypes) {
    const isAllPieType = arrayUtil.all(subChartTypes, subChartType =>
      predicate.isPieChart(subChartType)
    );

    return predicate.isComboChart(chartType) && isAllPieType;
  },

  /**
   * Whether line chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isLineChart(chartType) {
    return chartType === chartConst.CHART_TYPE_LINE;
  },

  /**
   * Whether area chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isAreaChart(chartType) {
    return chartType === chartConst.CHART_TYPE_AREA;
  },

  /**
   * Whether line and area combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} subChartTypes - types of chart
   * @returns {boolean}
   */
  isLineAreaComboChart(chartType, subChartTypes) {
    const isAllLineType = arrayUtil.all(
      subChartTypes || [],
      subChartType => predicate.isLineChart(subChartType) || predicate.isAreaChart(subChartType)
    );

    return predicate.isComboChart(chartType) && isAllLineType;
  },

  /**
   * Whether line and area combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} subChartTypes - types of chart
   * @returns {boolean}
   */
  hasLineChart(chartType, subChartTypes) {
    const hasLineType = arrayUtil.any(subChartTypes || [], subChartType =>
      predicate.isLineChart(subChartType)
    );

    return predicate.isComboChart(chartType) && hasLineType;
  },

  /**
   * Whether line and scatter combo chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} subChartTypes - types of chart
   * @returns {boolean}
   */
  isLineScatterComboChart(chartType, subChartTypes) {
    const isAllLineType = arrayUtil.all(
      subChartTypes || [],
      subChartType => predicate.isLineChart(subChartType) || predicate.isScatterChart(subChartType)
    );

    return predicate.isComboChart(chartType) && isAllLineType;
  },

  /**
   * Whether line type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @param {Array.<string>} [subChartTypes] - types of chart
   * @returns {boolean}
   */
  isLineTypeChart(chartType, subChartTypes) {
    return (
      predicate.isLineChart(chartType) ||
      predicate.isAreaChart(chartType) ||
      predicate.isLineAreaComboChart(chartType, subChartTypes)
    );
  },

  /**
   * Whether bubble chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isBubbleChart(chartType) {
    return chartType === chartConst.CHART_TYPE_BUBBLE;
  },

  /**
   * Whether scatter chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isScatterChart(chartType) {
    return chartType === chartConst.CHART_TYPE_SCATTER;
  },

  /**
   * Whether heatmap chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isHeatmapChart(chartType) {
    return chartType === chartConst.CHART_TYPE_HEATMAP;
  },

  /**
   * Whether treemap chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isTreemapChart(chartType) {
    return chartType === chartConst.CHART_TYPE_TREEMAP;
  },

  /**
   * Whether box type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isBoxTypeChart(chartType) {
    return predicate.isHeatmapChart(chartType) || predicate.isTreemapChart(chartType);
  },

  /**
   * Whether map type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isMapTypeChart(chartType) {
    return (
      this.isMapChart(chartType) || this.isHeatmapChart(chartType) || this.isTreemapChart(chartType)
    );
  },

  /**
   * Whether pie chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isPieChart(chartType) {
    // change to indexOf for handling alias
    return chartType && chartType.indexOf(chartConst.CHART_TYPE_PIE) !== -1;
  },

  /**
   * Whether map chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isMapChart(chartType) {
    return chartType === chartConst.CHART_TYPE_MAP;
  },

  /**
   * Whether coordinate type chart or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isCoordinateTypeChart(chartType) {
    return predicate.isBubbleChart(chartType) || predicate.isScatterChart(chartType);
  },

  /**
   * Whether allow rendering for minus point in area of series.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  allowMinusPointRender(chartType) {
    return (
      predicate.isLineTypeChart(chartType) ||
      predicate.isCoordinateTypeChart(chartType) ||
      predicate.isBoxTypeChart(chartType) ||
      predicate.isBulletChart(chartType)
    );
  },

  /**
   * Whether chart to detect mouse events on series or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isChartToDetectMouseEventOnSeries(chartType) {
    return (
      predicate.isPieChart(chartType) ||
      predicate.isMapChart(chartType) ||
      predicate.isCoordinateTypeChart(chartType)
    );
  },

  /**
   * Whether align of label is outer or not.
   * @memberOf module:predicate
   * @param {string} align - align of legend
   * @returns {boolean}
   */
  isLabelAlignOuter(align) {
    return align === chartConst.LABEL_ALIGN_OUTER;
  },

  /**
   * Whether show label or not.
   * @param {{showLabel: ?boolean, showLegend: ?boolean}} options - options
   * @returns {boolean}
   */
  isShowLabel(options) {
    return options.showLabel || options.showLegend;
  },

  /**
   * Whether show outer label or not.
   * @param {{showLabel: ?boolean, showLegend: ?boolean, labelAlign: string}} options - options
   * @returns {*|boolean}
   */
  isShowOuterLabel(options) {
    return predicate.isShowLabel(options) && predicate.isLabelAlignOuter(options.labelAlign);
  },

  /**
   * Whether align of legend is left or not.
   * @memberOf module:predicate
   * @param {string} align - align of legend
   * @returns {boolean}
   */
  isLegendAlignLeft(align) {
    return align === chartConst.LEGEND_ALIGN_LEFT;
  },

  /**
   * Whether align of legend is top or not.
   * @memberOf module:predicate
   * @param {string} align - align of legend
   * @returns {boolean}
   */
  isLegendAlignTop(align) {
    return align === chartConst.LEGEND_ALIGN_TOP;
  },

  /**
   * Whether align of legend is bottom or not.
   * @memberOf module:predicate
   * @param {string} align - align of legend
   * @returns {boolean}
   */
  isLegendAlignBottom(align) {
    return align === chartConst.LEGEND_ALIGN_BOTTOM;
  },

  /**
   * Whether horizontal legend or not.
   * @memberOf module:predicate
   * @param {string} align - align option for legend
   * @returns {boolean}
   */
  isHorizontalLegend(align) {
    return predicate.isLegendAlignTop(align) || predicate.isLegendAlignBottom(align);
  },

  /**
   * Whether vertical legend or not.
   * @memberOf module:predicate
   * @param {string} align - align option for legend
   * @returns {boolean}
   */
  isVerticalLegend(align) {
    return !predicate.isHorizontalLegend(align);
  },

  /**
   * Whether allowed stackType option or not.
   * @memberOf module:predicate
   * @param {string} chartType - type of chart
   * @returns {boolean}
   */
  isAllowedStackOption(chartType) {
    return (
      predicate.isBarChart(chartType) ||
      predicate.isColumnChart(chartType) ||
      predicate.isAreaChart(chartType)
    );
  },

  /**
   * Whether normal stack type or not.
   * @memberOf module:predicate
   * @param {boolean} stackType - stackType option
   * @returns {boolean}
   */
  isNormalStack(stackType) {
    return stackType === chartConst.NORMAL_STACK_TYPE;
  },

  /**
   * Whether percent stack type or not.
   * @memberOf module:predicate
   * @param {boolean} stackType - stackType option
   * @returns {boolean}
   */
  isPercentStack(stackType) {
    return stackType === chartConst.PERCENT_STACK_TYPE;
  },

  /**
   * Whether valid stackType option or not.
   * @memberOf module:predicate
   * @param {boolean} stackType - stackType option
   * @returns {boolean}
   */
  isValidStackOption(stackType) {
    return stackType && (predicate.isNormalStack(stackType) || predicate.isPercentStack(stackType));
  },

  /**
   * Whether allow range data or not.
   * @memberOf module:predicate
   * @param {string} chartType - chart type
   * @returns {boolean}
   */
  isAllowRangeData(chartType) {
    return predicate.isBarTypeChart(chartType) || predicate.isAreaChart(chartType);
  },

  /**
   * Whether align of yAxis is center or not.
   * @memberOf module:predicate
   * @param {boolean} hasRightYAxis - whether has right yAxis.
   * @param {string} alignOption - align option of yAxis.
   * @returns {boolean} whether - align center or not.
   */
  isYAxisAlignCenter(hasRightYAxis, alignOption) {
    return !hasRightYAxis && alignOption === chartConst.YAXIS_ALIGN_CENTER;
  },

  /**
   * Whether minus limit or not.
   * @memberOf module:predicate
   * @param {{min: number, max: number}} limit - limit
   * @returns {boolean}
   */
  isMinusLimit(limit) {
    return limit.min <= 0 && limit.max <= 0;
  },

  /**
   * Whether auto tick interval or not.
   * @param {string} [tickInterval] - tick interval option
   * @returns {boolean}
   */
  isAutoTickInterval(tickInterval) {
    return tickInterval === chartConst.TICK_INTERVAL_AUTO;
  },

  /**
   * Whether valid label interval or not.
   * @param {number} [labelInterval] - label interval option
   * @param {string} [tickInterval] - tick interval option
   * @returns {*|boolean}
   */
  isValidLabelInterval(labelInterval, tickInterval) {
    return labelInterval && labelInterval > 1 && !tickInterval;
  },

  /**
   * Whether datetime type or not.
   * @param {string} type - type
   * @returns {boolean}
   */
  isDatetimeType(type) {
    return type === chartConst.AXIS_TYPE_DATETIME;
  },

  /**
   * @param {string} chartType - type of chart
   * @returns {boolean} - whether it support ChartBase#showTooltip API
   */
  isSupportPublicShowTooptipAPI(chartType) {
    return (
      this.isBarChart(chartType) ||
      this.isColumnChart(chartType) ||
      this.isLineChart(chartType) ||
      this.isAreaChart(chartType) ||
      this.isBoxplotChart(chartType)
    );
  },

  /**
   * @param {string} chartType - type of chart
   * @returns {boolean} - whether it support ChartBase#hideTooltip API
   */
  isSupportPublicHideTooptipAPI(chartType) {
    return (
      this.isBarChart(chartType) ||
      this.isColumnChart(chartType) ||
      this.isLineChart(chartType) ||
      this.isAreaChart(chartType) ||
      this.isBoxplotChart(chartType)
    );
  }
};

export default predicate;
