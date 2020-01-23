/**
 * @fileoverview Line chart
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import predicate from '../helpers/predicate';
import DynamicDataHelper from './dynamicDataHelper';
import Series from '../components/series/lineChartSeries';
import rawDataHandler from '../models/data/rawDataHandler';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class LineChart extends ChartBase {
  /**
   * Line chart.
   * @param {Array.<Array>} rawData - raw data
   * @param {object} theme - chart theme
   * @param {object} options - chart options
   * @constructs LineChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @mixes lineTypeMixer
   */
  constructor(rawData, theme, options) {
    super({
      rawData,
      theme,
      options,
      hasAxes: true,
      isVertical: true
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-line-chart';

    /**
     * Series class
     * @type {function}
     */
    this.Series = Series;

    if (this.dataProcessor.isCoordinateType()) {
      delete this.options.xAxis.tickInterval;
      this.options.tooltip.grouped = false;
      this.options.series.shifting = false;
    }

    this._dynamicDataHelper = new DynamicDataHelper(this);
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
   * On change checked legend.
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @param {?object} rawData rawData
   * @param {?object} boundsParams addition params for calculating bounds
   * @override
   */
  onChangeCheckedLegends(checkedLegends, rawData, boundsParams) {
    this._dynamicDataHelper.reset();
    this._dynamicDataHelper.changeCheckedLegends(checkedLegends, rawData, boundsParams);
  }

  /**
   * Add data ratios.
   * @override
   * from axisTypeMixer
   */
  addDataRatios(limitMap) {
    const chartTypes = this.chartTypes || [this.chartType];
    const seriesOption = this.options.series || {};
    let addDataRatio;

    if (this.dataProcessor.isCoordinateType()) {
      addDataRatio = chartType => {
        const hasRadius = predicate.isBubbleChart(chartType);
        this.dataProcessor.addDataRatiosForCoordinateType(chartType, limitMap, hasRadius);
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
   * Add components
   * @override
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');

    this.componentManager.register('lineSeries', 'lineSeries');

    this.componentManager.register('xAxis', 'axis');

    if (this.hasRightYAxis) {
      this.componentManager.register('rightYAxis', 'axis');
    }

    this.componentManager.register('yAxis', 'axis');

    this.componentManager.register('legend', 'legend');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');

    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * from lineTypeMixer
   * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
   * @override
   */
  getScaleOption() {
    const scaleOption = {};
    const xAxisOption = this.options.xAxis;
    const yAxisOption = this.options.yAxis;
    let hasDateFormat, isDateTimeTypeXAxis;

    if (this.dataProcessor.isCoordinateType()) {
      isDateTimeTypeXAxis = xAxisOption && xAxisOption.type === 'datetime';
      hasDateFormat = isDateTimeTypeXAxis && snippet.isExisty(xAxisOption.dateFormat);

      scaleOption.xAxis = {
        valueType: 'x'
      };

      if (isDateTimeTypeXAxis) {
        scaleOption.xAxis.type = (xAxisOption || {}).dateTime;
      }

      if (hasDateFormat) {
        scaleOption.xAxis.format = (xAxisOption || {}).dateFormat;
      }

      scaleOption.yAxis = {
        valueType: 'y'
      };
    } else if (this.hasRightYAxis) {
      scaleOption.yAxis = this._makeYAxisScaleOption('yAxis', yAxisOption[0]);
      scaleOption.rightYAxis = this._makeYAxisScaleOption('yAxis', yAxisOption[1]);
    } else {
      scaleOption.yAxis = true;
    }

    return scaleOption;
  }

  _makeYAxisScaleOption(name, yAxisOption) {
    return {
      options: yAxisOption,
      areaType: 'yAxis'
    };
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
   * from chart/zoomMixer
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

export default LineChart;
