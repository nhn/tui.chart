/**
 * @fileoverview Area chart
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ChartBase from './chartBase';
import DynamicDataHelper from './dynamicDataHelper';
import rawDataHandler from '../models/data/rawDataHandler';
import Series from '../components/series/areaChartSeries';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class AreaChart extends ChartBase {
  /**
   * Area chart.
   * @constructs AreaChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData - raw data
   * @param {object} theme - chart theme
   * @param {object} options - chart options
   * @mixes axisTypeMixer
   * @mixes lineTypeMixer
   */
  constructor(rawData, theme, options) {
    rawDataHandler.removeSeriesStack(rawData.series);

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
    this.className = 'tui-area-chart';

    /**
     * Series class
     * @type {function}
     * @ignore
     */
    this.Series = Series;

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
   * @ignore
   */
  onChangeCheckedLegends(checkedLegends, rawData, boundsParams) {
    this._dynamicDataHelper.reset();
    this._dynamicDataHelper.changeCheckedLegends(checkedLegends, rawData, boundsParams);
  }

  /**
   * Add data ratios.
   * from axisTypeMixer
   * @override
   * @ignore
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

    chartTypes.forEach(addDataRatio);
  }

  /**
   * Add components
   * @override
   * @ignore
   */
  addComponents() {
    this.componentManager.register('title', 'title');
    this.componentManager.register('plot', 'plot');
    this.componentManager.register('legend', 'legend');

    this.componentManager.register('areaSeries', 'areaSeries');

    this.componentManager.register('xAxis', 'axis');
    this.componentManager.register('yAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip');
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }

  /**
   * Get scale option.
   * from lineTypeMixer
   * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
   * @override
   * @ignore
   */
  getScaleOption() {
    const scaleOption = {};

    if (this.dataProcessor.isCoordinateType()) {
      scaleOption.xAxis = {
        valueType: 'x'
      };
      scaleOption.yAxis = {
        valueType: 'y'
      };
    } else {
      scaleOption.yAxis = true;
    }

    return scaleOption;
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
   * @ignore
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
   * @ignore
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

export default AreaChart;
