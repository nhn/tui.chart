/**
 * @fileoverview Map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import mapManager from '../factories/mapManager';
import MapChartMapModel from './mapChartMapModel';
import MapChartDataProcessor from '../models/data/mapChartDataProcessor';
import ColorSpectrum from './colorSpectrum';

/** Class representing a point. */
class MapChart extends ChartBase {
  /**
   * Map chart.
   * @constructs MapChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options.map = mapManager.get(options.map);
    options.tooltip = options.tooltip || {};
    options.legend = options.legend || {};

    super({
      rawData,
      theme,
      options,
      DataProcessor: MapChartDataProcessor
    });

    /**
     * class name
     * @type {string}
     */
    this.className = 'tui-map-chart';
  }

  /**
   * Add components.
   * @override
   * @private
   */
  addComponents() {
    const seriesTheme = this.theme.series[this.chartType];
    const colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);
    this.mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);

    this.componentManager.register('mapSeries', 'mapSeries', {
      mapModel: this.mapModel,
      colorSpectrum
    });

    this.componentManager.register('title', 'title');

    this.componentManager.register('legend', 'spectrumLegend', {
      colorSpectrum
    });

    this.componentManager.register('tooltip', 'tooltip', {
      mapModel: this.mapModel,
      colorSpectrum
    });

    this.componentManager.register('zoom', 'zoom');
    this.componentManager.register('mouseEventDetector', 'mapChartEventDetector');
  }

  /**
   * setData
   * need to clearMapData before setData. To re-generate map data.
   * @param {object} rawData rawData
   * @api
   * @override
   */
  setData(rawData = null) {
    this.mapModel.clearMapData();
    super.setData(rawData);
  }

  /**
   * Get scale option.
   * @returns {{legend: boolean}}
   * @override
   */
  getScaleOption() {
    return {
      legend: true
    };
  }

  /**
   * Add data ratios.
   * @override
   */
  addDataRatios(limitMap) {
    this.dataProcessor.addDataRatios(limitMap.legend);
  }
}

export default MapChart;
