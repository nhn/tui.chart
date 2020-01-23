/**
 * @fileoverview Column and Line Combo chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import rawDataHandler from '../models/data/rawDataHandler';
import predicate from '../helpers/predicate';
import validTypeMakerForYAxisOptions from './validTypeMakerForYAxisOptions';

/** Class representing a point. */
class ColumnLineComboChart extends ChartBase {
  /**
   * Column and Line Combo chart.
   * @constructs ColumnLineComboChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options.tooltip = options.tooltip || {};
    options.tooltip.grouped = true;

    const typeData = validTypeMakerForYAxisOptions({
      rawSeriesData: rawData.series,
      yAxisOptions: options.yAxis
    });

    super({
      rawData,
      theme,
      options,
      chartTypes: typeData.chartTypes,
      seriesTypes: typeData.seriesTypes,
      hasAxes: true,
      isVertical: true
    });

    /**
     * yAxis options
     * @type {object}
     */
    this.yAxisOptions = this._makeYAxisOptions(this.chartTypes, options.yAxis);
  }

  /**
   * Make yAxis options.
   * from verticalTypeComboMixer
   * @param {Array.<string>} chartTypes chart types
   * @param {?object} yAxisOptions yAxis options
   * @returns {{column: ?object, line: ?object}} options map
   * @private
   */
  _makeYAxisOptions(chartTypes, yAxisOptions) {
    const options = {};
    yAxisOptions = yAxisOptions || {};
    chartTypes.forEach((chartType, index) => {
      options[chartType] = yAxisOptions[index] || yAxisOptions;
    });

    return options;
  }

  /**
   * On change selected legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @ignore
   */
  onChangeCheckedLegends(checkedLegends) {
    const originalRawData = this.dataProcessor.getOriginalRawData();
    const rawData = rawDataHandler.filterCheckedRawData(originalRawData, checkedLegends);
    const typeData = validTypeMakerForYAxisOptions({
      rawSeriesData: rawData.series,
      yAxisOptions: this.options.yAxis
    });

    this.chartTypes = typeData.chartTypes;
    this.seriesTypes = typeData.seriesTypes;

    this.protectedRerender(checkedLegends, rawData, typeData);
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('columnSeries', 'columnSeries');
    this.componentManager.register('lineSeries', 'lineSeries');

    this.componentManager.register('yAxis', 'axis');

    if (this.hasRightYAxis) {
      this.componentManager.register('rightYAxis', 'axis');
    }

    this.componentManager.register('xAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * @returns {{
   *      yAxis: {options: object, areaType: string, chartType: string, additionalParams: object},
   *      rightYAxis: {options: object, areaType: string, chartType: string, additionalParams: object}
   * }}
   * @override
   */
  getScaleOption() {
    const scaleOption = {
      yAxis: this._makeYAxisScaleOption('yAxis', this.chartTypes[0], !this.hasRightYAxis)
    };

    if (this.hasRightYAxis) {
      scaleOption.rightYAxis = this._makeYAxisScaleOption('rightYAxis', this.chartTypes[1]);
    }

    return scaleOption;
  }

  /**
   * Make y axis scale option.
   * @param {string} name - component name
   * @param {string} chartType - chart type
   * @param {boolean} isSingleYAxis - whether single y axis or not
   * @returns {{options: object, areaType: string, chartType: string, additionalParams: object}}
   * @private
   */
  _makeYAxisScaleOption(name, chartType, isSingleYAxis) {
    const yAxisOption = this.yAxisOptions[chartType];
    const additionalOptions = {
      isSingleYAxis: !!isSingleYAxis
    };

    if (isSingleYAxis && this.options.series) {
      this._setAdditionalOptions(additionalOptions);
    }

    return {
      options: yAxisOption,
      areaType: 'yAxis',
      chartType,
      additionalOptions
    };
  }

  /**
   * Set additional parameter for making y axis scale option.
   * @param {{isSingleYAxis: boolean}} additionalOptions - additional options
   * @private
   */
  _setAdditionalOptions(additionalOptions) {
    const { dataProcessor } = this;

    Object.entries(this.options.series).forEach(([seriesType, seriesOption]) => {
      if (!seriesOption.stackType) {
        return;
      }

      const chartType = dataProcessor.findChartType(seriesType);

      if (!predicate.isAllowedStackOption(chartType)) {
        return;
      }

      additionalOptions.chartType = chartType;
      additionalOptions.stackType = seriesOption.stackType;
    });
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios(limitMap) {
    const chartTypes = this.chartTypes || [this.chartType];
    const seriesOption = this.options.series || {};
    const addDataRatio = chartType => {
      const { stackType } = seriesOption[chartType] || seriesOption;

      this.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
    };

    chartTypes.forEach(addDataRatio);
  }
}

export default ColumnLineComboChart;
