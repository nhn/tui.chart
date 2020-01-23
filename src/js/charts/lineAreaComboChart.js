/**
 * @fileoverview Line and Area Combo chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import rawDataHandler from '../models/data/rawDataHandler';
import predicate from '../helpers/predicate';
import validTypeMakerForYAxisOptions from './validTypeMakerForYAxisOptions';
import DynamicDataHelper from './dynamicDataHelper';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class LineAreaComboChart extends ChartBase {
  /**
   * Line and Area Combo chart.
   * @constructs LineAreaComboChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData - raw data
   * @param {object} theme - chart theme
   * @param {object} options - chart options
   */
  constructor(rawData, theme, options) {
    const typeData = validTypeMakerForYAxisOptions({
      rawSeriesData: rawData.series,
      yAxisOptions: options.yAxis
    });

    options.tooltip = options.tooltip || {};
    options.tooltip.grouped = true;

    super({
      rawData,
      theme,
      options,
      seriesTypes: typeData.seriesTypes,
      chartTypes: typeData.chartTypes,
      hasAxes: true,
      isVertical: true
    });

    /**
     * yAxis options
     * @type {object}
     * @ignore
     */
    this.yAxisOptions = this._makeYAxisOptions(this.chartTypes, options.yAxis);

    this._dynamicDataHelper = new DynamicDataHelper(this);

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-combo-chart';
  }

  /**
   * On change selected legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @ignore
   */
  onChangeCheckedLegends(checkedLegends) {
    const currentData = this.dataProcessor.getCurrentData();
    const rawData = rawDataHandler.filterCheckedRawData(currentData, checkedLegends);
    const typeData = validTypeMakerForYAxisOptions({
      rawSeriesData: rawData.series,
      yAxisOptions: this.options.yAxis
    });

    this._dynamicDataHelper.reset();
    this._dynamicDataHelper.changeCheckedLegends(checkedLegends, rawData, typeData);
  }

  /**
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('areaSeries', 'areaSeries');
    this.componentManager.register('lineSeries', 'lineSeries');

    this.componentManager.register('xAxis', 'axis');
    this.componentManager.register('yAxis', 'axis');

    if (this.hasRightYAxis) {
      this.componentManager.register('rightYAxis', 'axis');
    }

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
   * from verticalTypeComboMixer
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
   * Make yAxis options.
   * @param {Array.<string>} chartTypes chart types
   * @param {?object} yAxisOptions yAxis options
   * @returns {{column: ?object, line: ?object}} options map
   * @private
   * from verticalTypeComboMixer
   */
  _makeYAxisOptions(chartTypes, yAxisOptions = {}) {
    const options = {};
    chartTypes.forEach((chartType, index) => {
      options[chartType] = yAxisOptions[index] || yAxisOptions;
    });

    return options;
  }

  /**
   * Add data.
   * @param {string} category - category
   * @param {Array} values - values
   * @api
   */
  addData(category, values) {
    this._dynamicDataHelper.addData(category, values);
  }

  /**
   * Set additional parameter for making y axis scale option.
   * @param {{isSingleYAxis: boolean}} additionalOptions - additional options
   * @private
   * from verticalTypeComboMixer
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
    let addDataRatio;

    if (this.dataProcessor.isCoordinateType()) {
      addDataRatio = chartType => {
        this.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, false);
      };
    } else {
      addDataRatio = chartType => {
        const { stackType } = seriesOption[chartType] || seriesOption;

        this.dataProcessor.addDataRatios(limitMap[chartType], stackType, chartType);
      };
    }

    snippet.forEachArray(chartTypes, addDataRatio);
  }

  /**
   * Add plot line.
   * @param {{index: number, color: string, id: string}} data - data
   * @override
   * @api
   */
  addPlotLine(data) {
    this.componentManager.get('plot').addPlotLine(data);
  }

  /**
   * Add plot band.
   * @param {{range: Array.<number>, color: string, id: string}} data - data
   * @override
   * @api
   */
  addPlotBand(data) {
    this.componentManager.get('plot').addPlotBand(data);
  }

  /**
   * Remove plot line.
   * @param {string} id - line id
   * @override
   * @api
   */
  removePlotLine(id) {
    this.componentManager.get('plot').removePlotLine(id);
  }

  /**
   * Remove plot band.
   * @param {string} id - band id
   * @override
   * @api
   */
  removePlotBand(id) {
    this.componentManager.get('plot').removePlotBand(id);
  }

  /**
   * Render for zoom.
   * from chart/zoomMixer
   * @param {boolean} isResetZoom - whether reset zoom or not
   * @private
   */
  _renderForZoom(isResetZoom) {
    const boundsAndScale = this.readyForRender();

    this.componentManager.render('zoom', boundsAndScale, { isResetZoom });
  }

  /**
   * On zoom.
   * nnfrom chart/zoomMixer
   * @param {Array.<number>} indexRange - index range for zoom
   * @override
   */
  onZoom(indexRange) {
    this._dynamicDataHelper.pauseAnimation();
    this.dataProcessor.updateRawDataForZoom(indexRange);
    this._renderForZoom(false);
  }

  /**
   * On reset zoom.
   * from chart/zoomMixer
   * @override
   */
  onResetZoom() {
    let rawData = this.dataProcessor.getOriginalRawData();

    if (this._dynamicDataHelper.checkedLegends) {
      rawData = rawDataHandler.filterCheckedRawData(
        rawData,
        this._dynamicDataHelper.checkedLegends
      );
    }

    this.dataProcessor.initData(rawData);
    this.dataProcessor.initZoomedRawData();
    this.dataProcessor.addDataFromRemainDynamicData(snippet.pick(this.options.series, 'shifting'));
    this._renderForZoom(true);
    this._dynamicDataHelper.restartAnimation();
  }
}

export default LineAreaComboChart;
