/**
 * @fileoverview Bounds model.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';
import raphaelRenderUtil from '../../plugins/raphaelRenderUtil';
import circleLegendCalculator from './circleLegendCalculator';
import axisCalculator from './axisCalculator';
import legendCalculator from './legendCalculator';
import seriesCalculator from './seriesCalculator';
import spectrumLegendCalculator from './spectrumLegendCalculator';
import snippet from 'tui-code-snippet';

const { browser } = snippet;
const { LEGEND_AREA_H_PADDING } = chartConst;
const IS_LTE_IE8 = browser.msie && browser.version <= 8;

/**
 * Dimension.
 * @typedef {{width: number, height:number}} dimension
 * @private
 */

/**
 * Position.
 * @typedef {{left: number, top:number}} position
 * @private
 */

/**
 * Bound.
 * @typedef {{dimension: dimension, position:position}} bound
 * @private
 */

class BoundsModel {
  /**
   * Bounds maker.
   * @constructs BoundsModel
   * @private
   * @param {object} params parameters
   */
  constructor(params) {
    /**
     * options
     * @type {object}
     */
    this.options = params.options || {};
    this.options.legend = this.options.legend || {};
    this.options.yAxis = this.options.yAxis || {};

    /**
     * theme
     * @type {object}
     */
    this.theme = params.theme || {};

    /**
     * whether chart has axes or not
     * @type {boolean}
     */
    this.hasAxes = params.hasAxes;

    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * series types
     */
    this.seriesTypes = params.seriesTypes || [];

    /**
     * data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    this.initBoundsData();
  }

  /**
   * Initialize bounds data.
   */
  initBoundsData() {
    this.dimensionMap = {
      legend: {
        width: 0
      },
      yAxis: {
        width: 0
      },
      rightYAxis: {
        width: 0
      },
      xAxis: {
        height: 0
      },
      circleLegend: {
        width: 0
      },
      chartExportMenu: {
        width: 0
      }
    };

    this.positionMap = {};

    /**
     * chart left padding
     * @type {number}
     */
    this.chartLeftPadding = chartConst.CHART_PADDING;

    this.maxRadiusForBubbleChart = null;

    this._registerChartDimension();
    this._registerTitleDimension();
    this._registerChartExportMenuDimension();
  }

  /**
   * Register dimension.
   * @param {string} name component name
   * @param {dimension} dimension component dimension
   * @private
   */
  _registerDimension(name, dimension) {
    this.dimensionMap[name] = snippet.extend(this.dimensionMap[name] || {}, dimension);
  }

  /**
   * Get bound.
   * @param {string} name component name
   * @returns {bound} component bound
   */
  getBound(name) {
    return {
      dimension: this.dimensionMap[name] || {},
      position: this.positionMap[name] || {}
    };
  }

  /**
   * Set bound.
   * @param {string} name component name
   * @param {bound} bound component bound
   * @private
   */
  _setBound(name, bound) {
    this.dimensionMap[name] = bound.dimension;
    this.positionMap[name] = bound.position;
  }

  /**
   * Get dimension.
   * @param {string} name component name
   * @returns {dimension} component dimension
   */
  getDimension(name) {
    return this.dimensionMap[name];
  }

  /**
   * Get dimension map.
   * @param {string} types - dimension type names
   * @returns {object}
   */
  getDimensionMap(types) {
    let dimensionMap = {};

    if (types && types.length) {
      types.forEach(type => {
        dimensionMap[type] = this.dimensionMap[type];
      });
    } else {
      ({ dimensionMap } = this);
    }

    return JSON.parse(JSON.stringify(dimensionMap));
  }

  /**
   * Get position.
   * @param {string} name component name
   * @returns {position} component position
   */
  getPosition(name) {
    return this.positionMap[name];
  }

  /**
   * Register chart dimension
   * @private
   */
  _registerChartDimension() {
    const chartOptions = this.options.chart || {};
    const dimension = {
      width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,
      height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT
    };

    this._registerDimension('chart', dimension);
  }

  /**
   * Register title dimension
   * @private
   */
  _registerTitleDimension() {
    const chartOptions = this.options.chart || {};
    const hasTitleOption = snippet.isExisty(chartOptions.title);
    const titleTheme = this.theme.title;
    const titleHeight = hasTitleOption
      ? raphaelRenderUtil.getRenderedTextSize(
          chartOptions.title.text,
          titleTheme.fontSize,
          titleTheme.fontFamily
        ).height
      : 0;
    let height = titleHeight || 0;

    if (height) {
      height += chartConst.TITLE_PADDING;
    }

    this._registerDimension('title', { height });
  }

  /**
   * Register chartExportMenu dimension
   * @private
   */
  _registerChartExportMenuDimension() {
    let dimension;

    if (this.options.chartExportMenu.visible === false) {
      dimension = {
        width: 0,
        height: 0
      };
    } else {
      dimension = {
        height: chartConst.CHART_EXPORT_MENU_SIZE + chartConst.SERIES_AREA_V_PADDING,
        width: chartConst.CHART_EXPORT_MENU_SIZE
      };
    }
    this._registerDimension('chartExportMenu', dimension);
  }

  /**
   * Register height for x axis component.
   */
  registerXAxisHeight() {
    this._registerDimension('xAxis', {
      height: axisCalculator.calculateXAxisHeight(this.options.xAxis, this.theme.xAxis)
    });
  }

  /**
   * Register dimension for legend component.
   */
  registerLegendDimension() {
    const legendLabels = snippet.pluck(this.dataProcessor.getOriginalLegendData(), 'label');
    const legendOptions = this.options.legend;
    const labelTheme = this.theme.legend.label;
    const chartWidth = this.getDimension('chart').width;
    const legendDimension = legendCalculator.calculate(
      legendOptions,
      labelTheme,
      legendLabels,
      chartWidth
    );

    this._registerDimension('legend', legendDimension);
  }

  /**
   * Register dimension for spectrum legend component.
   * @param {object} limit - min and maximum value
   */
  registerSpectrumLegendDimension(limit) {
    const maxValue = limit
      ? limit.max
      : this.dataProcessor.getFormattedMaxValue(this.chartType, 'legend');
    const minValue = limit ? limit.min : '';
    const labelTheme = this.theme.label;
    const { align } = this.options.legend;
    let dimension;

    if (predicate.isHorizontalLegend(align)) {
      const isBoxType = predicate.isBoxTypeChart(this.chartType);
      const isTopLegend = predicate.isLegendAlignTop(align);
      dimension = spectrumLegendCalculator._makeHorizontalDimension(
        maxValue,
        labelTheme,
        isBoxType,
        isTopLegend
      );
    } else {
      dimension = spectrumLegendCalculator._makeVerticalDimension(maxValue, minValue, labelTheme);
    }

    this._registerDimension('legend', dimension);
    this.useSpectrumLegend = true;
  }

  /**
   * Register dimension for y axis.
   * @param {object} dimensionInfos - options for calculate dimension
   *     @param {{min: number, max: number}} dimensionInfos.limit - min, max
   *     @param {string} dimensionInfos.componentName - component name like yAxis, rightYAxis
   *     @param {object} dimensionInfos.options - options for y axis
   *     @param {{title: object, label: object}} dimensionInfos.theme - them for y axis
   *     @param {Array} dimensionInfos.yAxisLabels - them for y axis
   *     @param {boolean} dimensionInfos.isVertical - whether vertical or not
   */
  registerYAxisDimension(dimensionInfos) {
    const {
      limit,
      options,
      theme,
      yAxisLabels,
      isVertical,
      axisName: componentName
    } = dimensionInfos;
    const isDiverging = this.options.series && this.options.series.diverging;
    let categories, yAxisOptions;

    if (limit) {
      categories = [limit.min, limit.max];
    } else if (predicate.isHeatmapChart(this.chartType) || !isVertical) {
      categories = this.dataProcessor.getCategories(true);
    } else {
      return;
    }

    if (snippet.isArray(options)) {
      yAxisOptions = componentName === 'yAxis' ? options[0] : options[1];
    } else {
      yAxisOptions = options;
    }

    this._registerDimension(componentName, {
      width: axisCalculator.calculateYAxisWidth(
        categories,
        yAxisOptions,
        theme,
        yAxisLabels,
        isDiverging
      )
    });
  }

  /**
   * Create series width.
   * @returns {number} series width
   */
  calculateSeriesWidth() {
    const maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'series', 'value');
    const dimensionMap = this.getDimensionMap(['chart', 'yAxis', 'legend', 'rightYAxis']);
    let maxLabelWidth = 0;
    if (!predicate.isColumnTypeChart(this.chartType)) {
      maxLabelWidth = renderUtil.getRenderedLabelHeight(maxLabel, this.theme.title);
    }
    let seriesWidth = seriesCalculator.calculateWidth(
      dimensionMap,
      this.options.legend,
      maxLabelWidth
    );

    if (predicate.isMapChart(this.chartType) && !IS_LTE_IE8) {
      seriesWidth -= chartConst.MAP_CHART_ZOOM_AREA_WIDTH + LEGEND_AREA_H_PADDING;
    }

    return seriesWidth;
  }

  /**
   * Create series height
   * @returns {number} series height
   */
  calculateSeriesHeight() {
    const dimensionMap = this.getDimensionMap([
      'chart',
      'title',
      'legend',
      'xAxis',
      'chartExportMenu'
    ]);
    let yAxisTitleAreaHeight = 0;

    if (this.options.yAxis && this.options.yAxis.title) {
      yAxisTitleAreaHeight = renderUtil.getRenderedLabelHeight(
        this.options.yAxis.title,
        this.theme.title
      );
    }

    return seriesCalculator.calculateHeight(
      dimensionMap,
      this.options.legend,
      yAxisTitleAreaHeight
    );
  }

  getBaseSizeForLimit(isVertical) {
    let baseSize;

    if (isVertical) {
      baseSize = this.calculateSeriesHeight();
    } else {
      baseSize = this.calculateSeriesWidth();
    }

    return baseSize;
  }

  /**
   * Make series dimension.
   * @returns {{width: number, height: number}} series dimension
   * @private
   */
  _makeSeriesDimension() {
    return {
      width: this.calculateSeriesWidth(),
      height: this.calculateSeriesHeight()
    };
  }

  /**
   * Register series dimension.
   */
  registerSeriesDimension() {
    const seriesDimension = this._makeSeriesDimension();

    this._registerDimension('series', seriesDimension);
  }

  /**
   * Update width of legend and series of BoundsModel.
   * @param {number} circleLegendWidth - width for circle legend
   * @param {number} diffWidth - difference width
   * @private
   */
  _updateLegendAndSeriesWidth(circleLegendWidth, diffWidth) {
    const legendOptions = this.options.legend;

    if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
      this._registerDimension('legend', {
        width: circleLegendWidth
      });
    }

    this._registerDimension('series', {
      width: this.getDimension('series').width - diffWidth
    });
  }

  /**
   * Register dimension of circle legend.
   * @param {object} axisDataMap - axisData map
   */
  registerCircleLegendDimension(axisDataMap) {
    const seriesDimension = this.getDimension('series');
    const { legend: legendOptions } = this.options;
    const maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'circleLegend', 'r');
    const {
      chart: { fontFamily }
    } = this.theme;
    let circleLegendWidth = circleLegendCalculator.calculateCircleLegendWidth(
      seriesDimension,
      axisDataMap,
      maxLabel,
      fontFamily
    );
    let legendWidth;

    if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
      legendWidth = this.getDimension('legend').width;
    } else {
      legendWidth = 0;
    }
    circleLegendWidth = Math.min(
      circleLegendWidth,
      Math.max(legendWidth, chartConst.MIN_LEGEND_WIDTH)
    );

    const diffWidth = circleLegendWidth - legendWidth;

    this._registerDimension('circleLegend', {
      width: circleLegendWidth,
      height: circleLegendWidth
    });

    /**
     * the reason why check diffWidth is positive:
     * if circle legend area is narrower than text legend area, patial text legend area is not showing.
     * because legend area width is set to circle legend area
     */
    if (diffWidth > 0) {
      /**
       * If circle legend area is wider than text legend area,
       * recalculate legend and series width, base on circle legend width
       */
      this._updateLegendAndSeriesWidth(circleLegendWidth, diffWidth);
    }
  }

  /**
   * Make plot dimention
   * @returns {{width: number, height: number}} plot dimension
   * @private
   */
  _makePlotDimension() {
    const seriesDimension = this.getDimension('series');

    return {
      width: seriesDimension.width,
      height: seriesDimension.height + chartConst.OVERLAPPING_WIDTH
    };
  }

  /**
   * Register center components dimension.
   * @private
   */
  _registerCenterComponentsDimension() {
    const seriesDimension = this.getDimension('series');

    this._registerDimension('tooltip', seriesDimension);
    this._registerDimension('mouseEventDetector', seriesDimension);
  }

  /**
   * Register axis components dimension.
   * @private
   */
  _registerAxisComponentsDimension() {
    const plotDimension = this._makePlotDimension();

    this._registerDimension('plot', plotDimension);

    this._registerDimension('xAxis', {
      width: plotDimension.width
    });

    this._registerDimension('yAxis', {
      height: plotDimension.height
    });

    this._registerDimension('rightYAxis', {
      height: plotDimension.height
    });
  }

  /**
   * Update width of dimensions.
   * @param {object} overflowInfo overflowLeft, overflowRight
   * @private
   */
  _updateDimensionsWidth(overflowInfo) {
    const overflowLeft = Math.max(overflowInfo.overflowLeft, 0);
    const overflowRight = overflowInfo.overflowRight ? Math.max(overflowInfo.overflowRight, 0) : 0;
    const margin = overflowLeft + overflowRight;

    this.chartLeftPadding += overflowLeft;
    this.dimensionMap.plot.width -= margin;
    this.dimensionMap.series.width -= margin;
    this.dimensionMap.mouseEventDetector.width -= margin;
    this.dimensionMap.xAxis.width -= margin;
  }

  /**
   * Update height of dimensions.
   * @param {number} diffHeight diff height
   * @private
   */
  _updateDimensionsHeight(diffHeight) {
    this.dimensionMap.plot.height -= diffHeight;
    this.dimensionMap.series.height -= diffHeight;
    this.dimensionMap.mouseEventDetector.height -= diffHeight;
    this.dimensionMap.tooltip.height -= diffHeight;
    this.dimensionMap.yAxis.height -= diffHeight;
    this.dimensionMap.rightYAxis.height -= diffHeight;
    this.dimensionMap.xAxis.height += diffHeight;
  }

  /**
   * Update dimensions for label of x axis.
   * @param {?object} xAxisData - axis data for x axis.
   * @private
   */
  _updateDimensionsForXAxisLabel(xAxisData) {
    if (xAxisData.overflowRight > 0 || xAxisData.overflowLeft > 0) {
      this._updateDimensionsWidth(xAxisData);
    }

    if (xAxisData.overflowHeight) {
      this._updateDimensionsHeight(xAxisData.overflowHeight);
    }
  }

  /**
   * Register axes type component positions.
   * @param {number} leftLegendWidth legend width
   * @private
   */
  _registerAxisComponentsPosition(leftLegendWidth) {
    const seriesPosition = this.getPosition('series');
    const seriesDimension = this.getDimension('series');
    const yAxisWidth = this.getDimension('yAxis').width;
    const leftAreaWidth = leftLegendWidth + yAxisWidth + seriesDimension.width;

    this.positionMap.plot = {
      top: seriesPosition.top,
      left: seriesPosition.left
    };

    this.positionMap.yAxis = {
      top: seriesPosition.top,
      left: this.chartLeftPadding + leftLegendWidth
    };

    this.positionMap.xAxis = {
      top: seriesPosition.top + seriesDimension.height,
      left: seriesPosition.left
    };

    this.positionMap.rightYAxis = {
      top: seriesPosition.top,
      left: this.chartLeftPadding + leftAreaWidth - chartConst.OVERLAPPING_WIDTH
    };
  }

  /**
   * Make legend position.
   * @returns {{top: number, left: number}} legend bound
   * @private
   */
  _makeLegendPosition() {
    const { dimensionMap } = this;
    const seriesDimension = dimensionMap.series;
    const seriesPositionTop = this.getPosition('series').top;
    const legendOption = this.options.legend;
    let top = 0;
    let yAxisAreaWidth, left;

    if (predicate.isHorizontalLegend(legendOption.align)) {
      left = (this.getDimension('chart').width - this.getDimension('legend').width) / 2;
      if (predicate.isLegendAlignBottom(legendOption.align)) {
        top =
          seriesPositionTop +
          seriesDimension.height +
          this.getDimension('xAxis').height +
          chartConst.SERIES_AREA_V_PADDING;
      } else {
        top = seriesPositionTop - dimensionMap.legend.height + chartConst.LEGEND_AREA_V_PADDING;
      }
    } else {
      if (predicate.isLegendAlignLeft(legendOption.align)) {
        left = this.chartLeftPadding;
      } else {
        yAxisAreaWidth = this.getDimension('yAxis').width + this.getDimension('rightYAxis').width;
        left = this.chartLeftPadding + yAxisAreaWidth + seriesDimension.width;
      }
      top = seriesPositionTop + chartConst.SERIES_AREA_V_PADDING;
    }

    return {
      top,
      left
    };
  }

  /**
   * make spectrum legend position
   * @returns {{top: number, left: number}} legend bound
   * @private
   */
  _makeSpectrumLegendPosition() {
    const legendOption = this.options.legend;
    const { align } = this.options.legend;
    const seriesPosition = this.getPosition('series');
    const seriesDimension = this.getDimension('series');
    const legendDimension = this.getDimension('legend');
    let top, left, right;

    if (predicate.isHorizontalLegend(align)) {
      left = (this.getDimension('chart').width - legendDimension.width) / 2;

      if (predicate.isLegendAlignTop(align)) {
        top = seriesPosition.top - legendDimension.height;
      } else {
        top = seriesPosition.top + seriesDimension.height + this.getDimension('xAxis').height;
      }
    } else {
      if (predicate.isLegendAlignLeft(legendOption.align)) {
        left = this.chartLeftPadding;
      } else {
        right = this.getDimension('chart').width - this.chartLeftPadding;
        left = right - this.getDimension('legend').width;
      }

      if (predicate.isBoxTypeChart(this.chartType)) {
        ({ top } = seriesPosition);
      } else {
        top = seriesPosition.top + chartConst.MAP_CHART_ZOOM_AREA_HEIGHT * 0.75;
      }
    }

    const position = {
      top,
      left
    };

    if (right) {
      position.right = right;
    }

    return position;
  }

  /**
   * Make chartExportMenu position.
   * @returns {{top: number, left: number}}
   * @private
   */
  _makeChartExportMenuPosition() {
    const top =
      this.getPosition('series').top -
      chartConst.SERIES_AREA_V_PADDING -
      chartConst.CHART_EXPORT_MENU_SIZE;

    return {
      top,
      right: chartConst.CHART_PADDING
    };
  }

  /**
   * Make CircleLegend position.
   * @returns {{top: number, left: number}}
   * @private
   */
  _makeCircleLegendPosition() {
    const seriesPosition = this.getPosition('series');
    const seriesDimension = this.getDimension('series');
    const circleDimension = this.getDimension('circleLegend');
    const legendOptions = this.options.legend;
    let left, legendWidth;

    if (predicate.isLegendAlignLeft(legendOptions.align)) {
      left = 0;
    } else {
      left = seriesPosition.left + seriesDimension.width;
    }

    if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
      legendWidth = this.getDimension('legend').width + chartConst.CHART_PADDING;
      left += (legendWidth - circleDimension.width) / 2;
    }

    return {
      top: seriesPosition.top + seriesDimension.height - circleDimension.height,
      left
    };
  }

  /**
   * Whether need expansion series or not.
   * @returns {boolean}
   * @private
   */
  _isNeedExpansionSeries() {
    const { chartType } = this;

    return (
      !(predicate.isPieChart(chartType) || predicate.isMapChart(chartType)) &&
      !predicate.isTreemapChart(chartType) &&
      !predicate.isRadialChart(chartType) &&
      !predicate.isPieDonutComboChart(chartType, this.seriesTypes)
    );
  }

  /**
   * Register essential components positions.
   * Essential components is all components except components for axis.
   * @private
   */
  _registerEssentialComponentsPositions() {
    const seriesPosition = this.getPosition('series');
    let tooltipPosition;

    this.positionMap.mouseEventDetector = Object.assign({}, seriesPosition);
    this.positionMap.legend = this.useSpectrumLegend
      ? this._makeSpectrumLegendPosition()
      : this._makeLegendPosition();
    this.positionMap.chartExportMenu = this._makeChartExportMenuPosition();

    if (this.getDimension('circleLegend').width) {
      this.positionMap.circleLegend = this._makeCircleLegendPosition();
    }

    if (this._isNeedExpansionSeries()) {
      tooltipPosition = {
        top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,
        left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE
      };
    } else {
      tooltipPosition = seriesPosition;
    }

    this.positionMap.tooltip = tooltipPosition;
  }

  /**
   * Register positions.
   * @private
   */
  _registerPositions() {
    const alignOption = this.options.legend.align;
    const isVisibleLegend = this.options.legend.visible;
    const legendDimension = this.getDimension('legend');
    const isLegendAlignTop = predicate.isLegendAlignTop(alignOption) && isVisibleLegend;
    const isLegendAlignLeft = predicate.isLegendAlignLeft(alignOption) && isVisibleLegend;
    const topLegendHeight = isLegendAlignTop ? legendDimension.height : 0;
    const leftLegendWidth = isLegendAlignLeft ? legendDimension.width : 0;
    const titleOrExportMenuHeight = Math.max(
      this.getDimension('title').height,
      this.getDimension('chartExportMenu').height
    );
    const yAxisTitlePadding = (() => {
      if (this.options.yAxis.title && !this.useSpectrumLegend) {
        const titlePadding = renderUtil.getRenderedLabelHeight(
          this.options.yAxis.title,
          this.theme.yAxis.title
        );

        return titlePadding + chartConst.Y_AXIS_TITLE_PADDING;
      }

      return 0;
    })();

    const seriesPadding = Math.max(
      0,
      Math.max(topLegendHeight, yAxisTitlePadding) - chartConst.TITLE_PADDING
    );
    let seriesTop = titleOrExportMenuHeight + seriesPadding;

    if (!titleOrExportMenuHeight) {
      seriesTop = Math.max(topLegendHeight, yAxisTitlePadding);
    }

    const seriesPosition = {
      top: seriesTop + chartConst.CHART_PADDING,
      left: this.chartLeftPadding + leftLegendWidth + this.getDimension('yAxis').width
    };

    this.positionMap.series = seriesPosition;

    if (this.hasAxes) {
      this._registerAxisComponentsPosition(leftLegendWidth);
    }

    this._registerEssentialComponentsPositions();
  }

  /**
   * Register bound of extended series for rendering.
   * @private
   */
  _registerExtendedSeriesBound() {
    let seriesBound = this.getBound('series');
    if (this._isNeedExpansionSeries()) {
      seriesBound = renderUtil.expandBound(seriesBound);
    }

    this._setBound('extendedSeries', seriesBound);
  }

  /**
   * Update bounds(positions, dimensions) of components for center option of yAxis.
   * @private
   */
  _updateBoundsForYAxisCenterOption() {
    const yAxisWidth = this.getDimension('yAxis').width;
    const yAxisExtensibleLeft =
      Math.floor(this.getDimension('series').width / 2) + chartConst.OVERLAPPING_WIDTH;
    const xAxisDecreasingLeft = yAxisWidth - chartConst.OVERLAPPING_WIDTH;
    const additionalLeft = renderUtil.isOldBrowser() ? 1 : 0;

    this.dimensionMap.extendedSeries.width += yAxisWidth;
    this.dimensionMap.xAxis.width += chartConst.OVERLAPPING_WIDTH;
    this.dimensionMap.plot.width += yAxisWidth + chartConst.OVERLAPPING_WIDTH;
    this.dimensionMap.mouseEventDetector.width += yAxisWidth;
    this.dimensionMap.tooltip.width += yAxisWidth;

    this.positionMap.series.left -= yAxisWidth - additionalLeft;
    this.positionMap.extendedSeries.left -= xAxisDecreasingLeft - additionalLeft;
    this.positionMap.plot.left -= xAxisDecreasingLeft;
    this.positionMap.yAxis.left += yAxisExtensibleLeft;
    this.positionMap.xAxis.left -= xAxisDecreasingLeft;
    this.positionMap.mouseEventDetector.left -= xAxisDecreasingLeft;
    this.positionMap.tooltip.left -= xAxisDecreasingLeft;
  }

  /**
   * Register bounds data.
   * @param {?object} xAxisData - axis data for x axis.
   */
  registerBoundsData(xAxisData) {
    this._registerCenterComponentsDimension();

    if (this.useSpectrumLegend) {
      this._updateDimensionsForSpectrumLegend();
    }

    if (this.hasAxes) {
      this._registerAxisComponentsDimension();
      this._updateDimensionsForXAxisLabel(xAxisData);
    }

    this._registerPositions();
    this._registerExtendedSeriesBound();

    if (this.options.yAxis.isCenter) {
      this._updateBoundsForYAxisCenterOption();
    }
  }

  /**
   * Update spectrum legend dimension, to prevent overflow
   * @private
   */
  _updateDimensionsForSpectrumLegend() {
    const legendAlignOption = this.options.legend.align;
    const legendDimension = this.getDimension('legend');
    const seriesDimension = this.getDimension('series');

    if (
      predicate.isHorizontalLegend(legendAlignOption) &&
      legendDimension.width > seriesDimension.width
    ) {
      legendDimension.width = seriesDimension.width;
    } else if (predicate.isVerticalLegend(legendAlignOption)) {
      if (predicate.isBoxTypeChart(this.chartType)) {
        legendDimension.height = seriesDimension.height;
      } else if (
        legendDimension.height >
        seriesDimension.height - chartConst.MAP_CHART_ZOOM_AREA_HEIGHT
      ) {
        legendDimension.height = seriesDimension.height - chartConst.MAP_CHART_ZOOM_AREA_HEIGHT;
      }
    }
  }

  /**
   * Calculate max radius.
   * @param {object} axisDataMap - axisData map
   * @returns {number}
   */
  calculateMaxRadius(axisDataMap) {
    const dimensionMap = this.getDimensionMap(['series', 'circleLegend']);
    const circleLegendVisible = this.options.circleLegend
      ? this.options.circleLegend.visible
      : false;

    return circleLegendCalculator.calculateMaxRadius(
      dimensionMap,
      axisDataMap,
      circleLegendVisible
    );
  }
}

export default BoundsModel;
