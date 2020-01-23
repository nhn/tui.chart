/**
 * @fileoverview Series component for rendering graph of heatmap chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import Series from './series';
import labelHelper from './renderingLabelHelper';

class HeatmapChartSeries extends Series {
  /**
   * Series component for rendering graph of heatmap chart.
   * @constructs HeatmapChartSeries
   * @private
   * @param {object} params - parameters
   * @extends Series
   */
  constructor(params) {
    super(params);

    /**
     * Color spectrum
     * @type {ColorSpectrum}
     */
    this.colorSpectrum = params.colorSpectrum;
  }

  /**
   * Make series data for rendering graph and sending to mouse event detector.
   * @returns {{
   *      groupBounds: Array.<Array.<{left: number, top: number, radius: number}>>,
   *      seriesDataModel: SeriesDataModel
   * }} series data
   * @private
   * @override
   */
  _makeSeriesData() {
    const groupBounds = this._makeBounds();
    const seriesDataModel = this._getSeriesDataModel();

    return {
      colorSpectrum: this.colorSpectrum,
      groupBounds,
      seriesDataModel,
      isAvailable: () => groupBounds && groupBounds.length > 0
    };
  }

  /**
   * Make bound for graph rendering.
   * @param {number} blockWidth - block width
   * @param {number} blockHeight - block height
   * @param {number} x - x index
   * @param {number} y - y index
   * @returns {{end: {left: number, top: number, width: number, height: number}}}
   * @private
   */
  _makeBound(blockWidth, blockHeight, x, y) {
    const {
      dimension: { height },
      position: { top, left }
    } = this.layout;

    return {
      end: {
        left: left + blockWidth * x,
        top: top + height - blockHeight * (y + 1),
        width: blockWidth,
        height: blockHeight
      }
    };
  }

  /**
   * Make bounds for graph rendering.
   * @returns {Array.<Array.<{left: number, top: number, radius: number}>>} positions
   * @private
   */
  _makeBounds() {
    const seriesDataModel = this._getSeriesDataModel();
    const { width, height } = this.layout.dimension;
    const blockWidth = width / this.dataProcessor.getCategoryCount(false);
    const blockHeight = height / this.dataProcessor.getCategoryCount(true);

    return seriesDataModel.map((seriesGroup, x) =>
      seriesGroup.map((seriesItem, y) => this._makeBound(blockWidth, blockHeight, x, y))
    );
  }

  /**
   * Call showWedge event of spectrum legend, when call showTooltip event.
   * @param {{indexes: {groupIndex: number, index: number}}} params - parameters
   */
  onShowTooltip({ indexes }) {
    const seriesDataModel = this._getSeriesDataModel();
    const { ratio, label } = seriesDataModel.getSeriesItem(indexes.groupIndex, indexes.index);

    this.eventBus.fire('showWedge', ratio, label);
  }

  /**
   * Render series label.
   * @param {object} paper - paper
   * @returns {Array.<object>}
   * @private
   */
  _renderSeriesLabel(paper) {
    const sdm = this._getSeriesDataModel();
    const boundsSet = this.seriesData.groupBounds;
    const labelTheme = this.theme.label;
    const selectedIndex = this.selectedLegendIndex;
    const positionsSet = labelHelper.boundsToLabelPositions(sdm, boundsSet, labelTheme);
    const labels = sdm.map(datum => this.decorateLabel(datum.valuesMap.value));

    return this.graphRenderer.renderSeriesLabel(
      paper,
      positionsSet,
      labels,
      labelTheme,
      selectedIndex
    );
  }

  /**
   * Resize.
   * @override
   */
  resize(...args) {
    this.boundMap = null;

    Series.prototype.resize.apply(this, args);
  }

  /**
   * Make exportation data for public event of series type.
   * @param {object} seriesData - series data
   * @returns {{x: number, y: number}}
   * @private
   */
  _makeExportationSeriesData({ indexes }) {
    return {
      x: indexes.groupIndex,
      y: indexes.index
    };
  }
}

/**
 * heatmapChartSeriesFactory
 * @param {object} params chart options
 * @returns {object} heatmapChart series instance
 * @ignore
 */
export default function heatmapChartSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = 'heatmap';

  return new HeatmapChartSeries(params);
}

heatmapChartSeriesFactory.componentType = 'series';
heatmapChartSeriesFactory.HeatmapChartSeries = HeatmapChartSeries;
