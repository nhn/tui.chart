import scaleDataMaker from './scaleDataMaker';
import scaleLabelFormatter from './scaleLabelFormatter';
import axisDataMaker from './axisDataMaker';
import predicate from '../../helpers/predicate';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';

class ScaleDataModel {
  /**
   * ScaleDataModel is scale model for scale data and axis data.
   * @param {object} params - parameters
   * @constructs ScaleDataModel
   * @private
   */
  constructor(params) {
    this.chartType = params.chartType;
    this.seriesTypes = params.seriesTypes;
    this.dataProcessor = params.dataProcessor;
    this.boundsModel = params.boundsModel;
    this.options = params.options;
    this.theme = params.theme;
    this.hasRightYAxis = !!params.hasRightYAxis;
    this.prevValidLabelCount = null;

    this.initScaleData(params.addedDataCount);
    this.initForAutoTickInterval();
  }

  /**
   * Initialize scale data.
   * @param {?number} addedDataCount - increased added count by dynamic adding data
   */
  initScaleData(addedDataCount) {
    this.scaleDataMap = {};
    this.axisDataMap = {};
    this.addedDataCount = addedDataCount;
  }

  /**
   * Initialize for auto tick interval.
   */
  initForAutoTickInterval() {
    this.firstTickCount = null;
  }

  /**
   * Pick limit option.
   * @param {{min: ?number, max: ?number}} axisOptions - axis options
   * @returns {{min: ?number, max: ?number}}
   * @private
   */
  _pickLimitOption(axisOptions) {
    axisOptions = axisOptions || {};

    return {
      min: axisOptions.min,
      max: axisOptions.max
    };
  }

  /**
   * Create base scale data.
   * @param {{
   *      chartType: string,
   *      areaType: string,
   *      valueType: string
   * }} typeMap - type map
   * @param {{
   *      type: string,
   *      stackType: string,
   *      diverging: boolean
   * }} baseOptions - base options
   * @param {object} axisOptions - axis options
   * @param {object} additionalOptions - additional options
   * @returns {{limit: {min: number, max: number}, step: number}}
   * @private
   */
  _createBaseScaleData(typeMap, baseOptions, axisOptions, additionalOptions) {
    const { chartType } = typeMap;
    const isVertical = typeMap.areaType !== 'xAxis';
    const baseValues = this.dataProcessor.createBaseValuesForLimit(
      chartType,
      additionalOptions.isSingleYAxis,
      baseOptions.stackType,
      typeMap.valueType,
      typeMap.areaType
    );

    const baseSize = this.boundsModel.getBaseSizeForLimit(isVertical);
    const options = Object.assign(baseOptions, {
      isVertical,
      limitOption: this._pickLimitOption(axisOptions),
      tickCounts: additionalOptions.tickCounts,
      showLabel: this.options.series.showLabel
    });

    if (predicate.isBubbleChart(chartType)) {
      options.overflowItem = this.dataProcessor.findOverflowItem(chartType, typeMap.valueType);
    }

    if (
      predicate.isMapChart(chartType) ||
      predicate.isHeatmapChart(chartType) ||
      predicate.isTreemapChart(chartType)
    ) {
      options.useSpectrumLegend = true;
    }

    return scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);
  }

  /**
   * Create scale labels.
   * @param {{limit: {min: number, max: number}, step: number}} baseScaleData - base scale data
   * @param {{
   *      chartType: string,
   *      areaType: string,
   *      valueType: string
   * }} typeMap - type map
   * @param {{
   *      type: string,
   *      stackType: string,
   *      diverging: boolean
   * }} baseOptions - base options
   * @param {string} dateFormat - date format
   * @returns {Array.<string>}
   * @private
   */
  _createScaleLabels(baseScaleData, typeMap, baseOptions, dateFormat) {
    const formatFunctions = this.dataProcessor.getFormatFunctions();
    const options = Object.assign(baseOptions, {
      dateFormat
    });

    return scaleLabelFormatter.createFormattedLabels(
      baseScaleData,
      typeMap,
      options,
      formatFunctions
    );
  }

  /**
   * Create scale.
   * @param {object} axisOptions - axis options
   * @param {{chartType: string, areaType: string, valueType: string}} typeMap - type map
   * @param {?object} additionalOptions - additional options
   * @returns {object}
   * @private
   */
  _createScaleData(axisOptions, typeMap, additionalOptions) {
    let seriesOptions = this.options.series;
    const chartType = typeMap.chartType || this.chartType;

    typeMap.chartType = chartType;
    seriesOptions = seriesOptions[chartType] || seriesOptions;

    const baseOptions = {
      stackType: additionalOptions.stackType || seriesOptions.stackType,
      diverging: seriesOptions.diverging,
      type: axisOptions.type
    };
    const baseScaleData = this._createBaseScaleData(
      typeMap,
      baseOptions,
      axisOptions,
      additionalOptions
    );

    return snippet.extend(baseScaleData, {
      labels: this._createScaleLabels(baseScaleData, typeMap, baseOptions, axisOptions.dateFormat),
      axisOptions
    });
  }

  /**
   * Create value type axis data.
   * @param {{labels: Array.<string>, limit: {min: number, max: number}, step: number}} scaleData - scale data
   * @param {object} labelTheme - label theme
   * @param {boolean} aligned - aligned tick and label
   * @param {boolean} isVertical - whether vertical or not
   * @param {boolean} isPositionRight - whether right position or not
   * @returns {{
   *      labels: Array.<string>,
   *      tickCount: number,
   *      validTickCount: number,
   *      isLabelAxis: boolean,
   *      limit: {min: number, max: number},
   *      isVertical: boolean
   * }}
   * @private
   */
  _createValueAxisData(scaleData, labelTheme, aligned, isVertical, isPositionRight) {
    const hasCategories = this.dataProcessor.hasCategories();
    const isCoordinateLineType = !isVertical && !hasCategories && aligned;
    const { labels, limit, step } = scaleData;
    const tickCount = labels.length;

    const axisData = axisDataMaker.makeValueAxisData({
      labels,
      tickCount: labels.length,
      limit,
      step,
      labelTheme,
      aligned,
      options: scaleData.axisOptions,
      isVertical: !!isVertical,
      isPositionRight: !!isPositionRight
    });

    if (isCoordinateLineType) {
      const values = this.dataProcessor.getValues(this.chartType, 'x');
      const additional = axisDataMaker.makeAdditionalDataForCoordinateLineType(
        labels,
        values,
        limit,
        step,
        tickCount
      );
      snippet.extend(axisData, additional);
    }

    return axisData;
  }

  /**
   * Create label type axis data.
   * @param {object} axisOptions - options for axis
   * @param {object} labelTheme - label theme
   * @param {boolean} aligned - aligned tick and label
   * @param {boolean} isVertical - whether vertical or not
   * @param {boolean} isPositionRight - whether right position or not
   * @returns {{
   *      labels: Array.<string>,
   *      tickCount: number,
   *      validTickCount: number,
   *      isLabelAxis: boolean,
   *      options: object,
   *      isVertical: boolean,
   *      isPositionRight: boolean,
   *      aligned: boolean
   * }}
   * @private
   */
  _createLabelAxisData(axisOptions, labelTheme, aligned, isVertical, isPositionRight) {
    const labels = axisOptions.categories || this.dataProcessor.getCategories(isVertical);

    return axisDataMaker.makeLabelAxisData({
      labels,
      options: axisOptions,
      labelTheme,
      aligned,
      isVertical: !!isVertical,
      isPositionRight: !!isPositionRight,
      addedDataCount: this.options.series.shifting ? this.addedDataCount : 0
    });
  }

  /**
   * Create axis data.
   * @param {object} scaleData - scale data
   * @param {object} axisOptions - axis options
   * @param {object} labelTheme - them for label
   * @param {boolean} isVertical - whether vertical or not
   * @param {boolean} isPositionRight - whether right position or not
   * @returns {object}
   * @private
   */
  _createAxisData(scaleData, axisOptions, labelTheme, isVertical, isPositionRight) {
    const aligned =
      predicate.isLineTypeChart(this.chartType, this.seriesTypes) && !axisOptions.pointOnColumn;
    let axisData;

    if (scaleData) {
      axisData = this._createValueAxisData(
        scaleData,
        labelTheme,
        aligned,
        isVertical,
        isPositionRight
      );
    } else {
      axisData = this._createLabelAxisData(
        axisOptions,
        labelTheme,
        aligned,
        isVertical,
        isPositionRight
      );
    }

    return axisData;
  }

  /**
   * Create axes data.
   * @returns {object.<string, object>}
   * @private
   */
  _createAxesData() {
    const { scaleDataMap, options, theme } = this;
    const yAxisOptions = snippet.isArray(options.yAxis) ? options.yAxis : [options.yAxis];
    const dataMap = {};

    dataMap.xAxis = this._createAxisData(scaleDataMap.xAxis, options.xAxis, theme.xAxis.label);
    dataMap.yAxis = this._createAxisData(
      scaleDataMap.yAxis,
      yAxisOptions[0],
      theme.yAxis.label,
      true
    );

    if (this.hasRightYAxis) {
      dataMap.rightYAxis = this._createAxisData(
        scaleDataMap.rightYAxis,
        yAxisOptions[1],
        theme.yAxis.label,
        true,
        true
      );
      if (!dataMap.rightYAxis.aligned) {
        dataMap.rightYAxis.aligned = dataMap.yAxis.aligned;
      }
    }

    return dataMap;
  }

  /**
   * Add scale.
   * @param {string} axisName - axis name
   * @param {options} axisOptions - axis options
   * @param {{chartType: string, areaType: string}} typeMap - type map
   * @param {object} additionalOptions - additional parameters
   */
  addScale(axisName, axisOptions, typeMap = {}, additionalOptions = {}) {
    typeMap.areaType = typeMap.areaType || axisName;
    typeMap.chartType = additionalOptions.chartType || typeMap.chartType;

    this.scaleDataMap[axisName] = this._createScaleData(axisOptions, typeMap, additionalOptions);
  }

  /**
   * Set axis data map.
   */
  setAxisDataMap() {
    this.axisDataMap = this._createAxesData();
  }

  /**
   * Update x axis data for auto tick interval.
   * @param {object} prevXAxisData - previous xAxis data
   * @param {?boolean} addingDataMode - whether adding data mode or not
   */
  updateXAxisDataForAutoTickInterval(prevXAxisData, addingDataMode) {
    const shiftingOption = this.options.series.shifting;
    const zoomableOption = this.options.series.zoomable;
    const xAxisData = this.axisDataMap.xAxis;
    const seriesWidth = this.boundsModel.getDimension('series').width;
    const addedCount = this.addedDataCount;

    if (shiftingOption || !prevXAxisData || zoomableOption) {
      axisDataMaker.updateLabelAxisDataForAutoTickInterval(
        xAxisData,
        seriesWidth,
        addedCount,
        addingDataMode
      );
    } else {
      axisDataMaker.updateLabelAxisDataForStackingDynamicData(
        xAxisData,
        prevXAxisData,
        this.firstTickCount
      );
    }

    if (!this.firstTickCount) {
      this.firstTickCount = xAxisData.tickCount;
    }
  }

  /**
   * Update x axis data for label.
   * @param {?boolean} addingDataMode - whether adding data mode or not
   */
  updateXAxisDataForLabel(addingDataMode) {
    const axisData = this.axisDataMap.xAxis;
    const dimensionMap = this.boundsModel.getDimensionMap(['series', 'yAxis', 'chart']);
    const { isLabelAxis } = axisData;
    const theme = this.theme.xAxis.label;
    let validLabelCount, additionalData;
    let { labels } = axisData;

    if (addingDataMode) {
      labels = labels.slice(0, labels.length - 1);
    }

    labels = renderUtil.addPrefixSuffix(
      labels,
      this.options.xAxis.prefix,
      this.options.xAxis.suffix
    );

    const validLabels = snippet.filter(labels, label => !!label);

    if (!snippet.isNull(this.prevValidLabelCount)) {
      validLabelCount = this.prevValidLabelCount;
    } else {
      validLabelCount = validLabels.length;
    }

    if (this.options.yAxis.isCenter) {
      validLabelCount += 1;
      dimensionMap.yAxis.width = 0;
    }

    if (axisData.options.rotateLabel === false) {
      additionalData = axisDataMaker.makeAdditionalDataForMultilineLabels(
        labels,
        validLabelCount,
        theme,
        isLabelAxis,
        dimensionMap
      );
    } else {
      additionalData = axisDataMaker.makeAdditionalDataForRotatedLabels(
        validLabels,
        validLabelCount,
        theme,
        isLabelAxis,
        dimensionMap
      );
    }

    this.prevValidLabelCount = validLabelCount;

    snippet.extend(axisData, additionalData);
  }

  /**
   * Find limit from limitMap by seriesIndex
   * @param {object} limitMap - limit map
   * @param {number} seriesIndex - series index
   * @param {boolean} isVertical - whether vertical or not
   * @returns {boolean}
   * @private
   */
  _findLimit(limitMap, seriesIndex, isVertical) {
    let limit;

    if (seriesIndex === 0) {
      limit = isVertical ? limitMap.yAxis : limitMap.xAxis;
    } else {
      limit = limitMap.rightYAxis ? limitMap.rightYAxis : limitMap.yAxis;
    }

    return limit;
  }

  /**
   * Make limit map.
   * @param {Array.<string>} seriesTypes - series types like bar, column, line, area
   * @param {boolean} isVertical - whether vertical or not
   * @returns {{
   *      xAxis: ?{min: number, max: number},
   *      yAxis: ?{min: number, max: number},
   *      rightYAxis: ?{min: number, max: number},
   *      legend: ?{min: number, max: number},
   *      bar: ?{min: number, max: number}
   * }}
   * @private
   */
  makeLimitMap(seriesTypes, isVertical) {
    const { scaleDataMap } = this;
    const limitMap = {};

    if (scaleDataMap.xAxis) {
      limitMap.xAxis = scaleDataMap.xAxis.limit;
    }

    if (scaleDataMap.yAxis) {
      limitMap.yAxis = scaleDataMap.yAxis.limit;
    }

    if (scaleDataMap.rightYAxis) {
      limitMap.rightYAxis = scaleDataMap.rightYAxis.limit;
    }

    if (scaleDataMap.legend) {
      limitMap.legend = scaleDataMap.legend.limit;
    }

    seriesTypes.forEach((seriesType, index) => {
      limitMap[seriesType] = this._findLimit(limitMap, index, isVertical);
    });

    return limitMap;
  }
}

export default ScaleDataModel;
