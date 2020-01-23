/**
 * @fileoverview Heatmap chart is a graphical representation of data where the individual values contained
 *                      in a matrix are represented as colors.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import ColorSpectrum from './colorSpectrum';
import chartConst from '../const';

/** Class representing a point. */
class HeatmapChart extends ChartBase {
  /**
   * Heatmap chart is a graphical representation of data where the individual values contained
   *      in a matrix are represented as colors.
   * @constructs HeatmapChart
   * @extends ChartBase
   * @mixes axisTypeMixer
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    options.tooltip = options.tooltip || {};

    if (!options.tooltip.align) {
      options.tooltip.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
    }

    options.tooltip.grouped = false;

    super({
      rawData,
      theme,
      options,
      hasAxes: true,
      isVertical: true
    });

    /**
     *
     * className
     * @type {string}
     */
    this.className = 'tui-heatmap-chart';
  }

  /**
   * Add components.
   * @private
   */
  _addComponents() {
    const seriesTheme = this.theme.series[this.chartType];
    const colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

    this._addComponentsForAxisType({
      axis: [
        {
          name: 'yAxis',
          isVertical: true
        },
        {
          name: 'xAxis'
        }
      ],
      legend: {
        classType: 'spectrumLegend',
        additionalParams: {
          colorSpectrum
        }
      },
      series: [
        {
          name: 'heatmapSeries',
          data: {
            colorSpectrum
          }
        }
      ],
      tooltip: true,
      mouseEventDetector: true
    });
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
    this.dataProcessor.addDataRatios(limitMap.legend, null, this.chartType);
  }

  /**
   * Add components.
   * @override
   * @private
   */
  addComponents() {
    const seriesTheme = this.theme.series[this.chartType];
    const colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

    this.componentManager.register('title', 'title');
    this.componentManager.register('legend', 'spectrumLegend', { colorSpectrum });

    this.componentManager.register('heatmapSeries', 'heatmapSeries', { colorSpectrum });

    this.componentManager.register('xAxis', 'axis');
    this.componentManager.register('yAxis', 'axis');

    this.componentManager.register('chartExportMenu', 'chartExportMenu');
    this.componentManager.register('tooltip', 'tooltip', { colorSpectrum });
    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
  }
}

export default HeatmapChart;
