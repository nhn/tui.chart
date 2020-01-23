/**
 * @fileoverview Treemap chart is graphical representation of hierarchical data by using rectangles.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import ChartBase from './chartBase';
import ColorSpectrum from './colorSpectrum';
import snippet from 'tui-code-snippet';

/** Class representing a point. */
class TreemapChart extends ChartBase {
  /**
   * Treemap chart is graphical representation of hierarchical data by using rectangles.
   * @constructs TreemapChart
   * @extends ChartBase
   * @param {Array.<Array>} rawData raw data
   * @param {object} theme chart theme
   * @param {object} options chart options
   */
  constructor(rawData, theme, options) {
    // options.series = options.series || {};
    options.tooltip = options.tooltip || {};
    options.tooltip.grouped = false;

    super({
      rawData,
      theme,
      options,
      hasAxes: false,
      isVertical: true
    });

    /**
     * className
     * @type {string}
     */
    this.className = 'tui-treemap-chart';
  }

  /**
   * Add components.
   * @override
   */
  addComponents() {
    const seriesTheme = this.theme.series[this.chartType];
    const { useColorValue } = this.options.series;
    const colorSpectrum = useColorValue
      ? new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor)
      : null;
    this.componentManager.register('title', 'title');
    this.componentManager.register('treemapSeries', 'treemapSeries', { colorSpectrum });

    if (useColorValue && this.options.legend.visible) {
      this.componentManager.register('legend', 'spectrumLegend', { colorSpectrum });
    }

    this.componentManager.register(
      'tooltip',
      'tooltip',
      Object.assign({
        labelTheme: snippet.pick(this.theme, 'series', 'label'),
        colorSpectrum
      })
    );

    this.componentManager.register('mouseEventDetector', 'mouseEventDetector');
    this.componentManager.register('chartExportMenu', 'chartExportMenu');
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
   * Add data ratios to dataProcessor for rendering graph.
   * @override
   */
  addDataRatios(limitMap) {
    this.dataProcessor.addDataRatiosForTreemapChart(limitMap.legend, this.chartType);
  }

  /**
   * On zoom.
   * @param {number} index - index of target seriesItem
   */
  onZoom(index) {
    this.componentManager.render('zoom', null, { index });
  }
}

export default TreemapChart;
