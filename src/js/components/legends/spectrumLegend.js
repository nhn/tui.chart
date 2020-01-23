/**
 * @fileoverview  Spectrum Legend component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import pluginFactory from '../../factories/pluginFactory';
import snippet from 'tui-code-snippet';

const {
  COMPONENT_TYPE_RAPHAEL,
  MAP_LEGEND_LABEL_PADDING,
  MAP_LEGEND_GRAPH_SIZE,
  CHART_PADDING
} = chartConst;

class SpectrumLegend {
  /**
   * Spectrum Legend component.
   * @constructs SpectrumLegend
   * @private
   * @param {object} params parameters
   *      @param {object} params.theme axis theme
   *      @param {?Array.<string>} params.options legend options
   *      @param {MapChartDataProcessor} params.dataProcessor data processor
   */
  constructor(params) {
    const {
      libType,
      chartType,
      theme,
      options = {},
      dataProcessor,
      colorSpectrum,
      eventBus
    } = params;

    /**
     * chart type
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * legend theme
     * @type {Object}
     */
    this.theme = theme;

    if (!predicate.isTreemapChart(this.chartType)) {
      this.theme.label.color = '#fff';
    }

    /**
     * options
     * @type {object}
     */
    this.options = options;

    /**
     * data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = dataProcessor;

    /**
     * color spectrum
     * @type {ColorSpectrum}
     */
    this.colorSpectrum = colorSpectrum;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = eventBus;

    /**
     * Graph renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(libType, 'mapLegend');

    /**
     * Whether horizontal legend or not.
     * @type {boolean}
     */
    this.isHorizontal = predicate.isHorizontalLegend(this.options.align);

    /**
     * scale data for legend
     * @type {null|object}
     */
    this.scaleData = null;

    this.drawingType = COMPONENT_TYPE_RAPHAEL;

    this._attachToEventBus();
  }

  /**
   * Attach to event bus.
   * @private
   */
  _attachToEventBus() {
    this.eventBus.on(
      {
        showWedge: this.onShowWedge,
        hideTooltip: this.onHideWedge
      },
      this
    );
    this.eventBus.on(
      'beforeImageDownload',
      snippet.bind(this._removeLocationURLFromFillAttribute, this)
    );
    this.eventBus.on(
      'afterImageDownload',
      snippet.bind(this._restoreLocationURLToFillAttribute, this)
    );
  }

  /**
   * Remove location URL from fill attribute
   * @private
   */
  _removeLocationURLFromFillAttribute() {
    this.graphRenderer.removeLocationURLFromFillAttribute();
  }

  /**
   * Restore location URL to fill attribute
   * @private
   */
  _restoreLocationURLToFillAttribute() {
    this.graphRenderer.restoreLocationURLToFillAttribute();
  }

  /**
   * Make base data to make tick html.
   * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data
   * @private
   */
  _makeBaseDataToMakeTickArea() {
    const { dimension } = this.layout;
    const {
      scaleData,
      options: { align }
    } = this;
    const stepCount = scaleData.stepCount || scaleData.tickCount - 1;
    const baseData = {};

    baseData.position = this.layout.position;

    if (this.isHorizontal) {
      baseData.step = dimension.width / stepCount;

      if (predicate.isLegendAlignTop(align)) {
        baseData.position.top -= MAP_LEGEND_LABEL_PADDING;
      } else {
        baseData.position.top += MAP_LEGEND_GRAPH_SIZE + MAP_LEGEND_LABEL_PADDING;
      }
    } else {
      baseData.step = dimension.height / stepCount;

      if (predicate.isLegendAlignLeft(align)) {
        baseData.position.left = CHART_PADDING;
      } else {
        baseData.position.left += MAP_LEGEND_GRAPH_SIZE + MAP_LEGEND_LABEL_PADDING;
      }
    }

    return baseData;
  }

  /**
   * Render tick area.
   * @param {Array.<object>} legendSet legend set
   * @private
   */
  _renderTickArea(legendSet) {
    if (this.options.reversed) {
      this.scaleData.labels.sort((prev, next) => next - prev);
    }

    this.graphRenderer.renderTickLabels(
      this.paper,
      this._makeBaseDataToMakeTickArea(),
      this.scaleData.labels,
      this.options.align,
      legendSet
    );
  }

  /**
   * Make graph dimension of vertical legend
   * @returns {{width: number, height: number}} dimension
   * @private
   */
  _makeVerticalGraphDimension() {
    return {
      width: MAP_LEGEND_GRAPH_SIZE,
      height: this.layout.dimension.height
    };
  }

  /**
   * Make graph dimension of horizontal legend
   * @returns {{width: number, height: number}} dimension
   * @private
   */
  _makeHorizontalGraphDimension() {
    return {
      width: this.layout.dimension.width,
      height: MAP_LEGEND_GRAPH_SIZE
    };
  }

  /**
   * Render graph.
   * @param {Array.<object>} legendSet legend set
   * @private
   */
  _renderGraph(legendSet) {
    const { position } = this.layout;
    let dimension;

    if (this.isHorizontal) {
      dimension = this._makeHorizontalGraphDimension();
    } else {
      dimension = this._makeVerticalGraphDimension();
    }

    if (this.options.reversed) {
      const startForSwap = this.colorSpectrum.start;
      this.colorSpectrum.start = this.colorSpectrum.end;
      this.colorSpectrum.end = startForSwap;
    }

    this.graphRenderer.render({
      paper: this.paper,
      layout: {
        dimension,
        position
      },
      colorSpectrum: this.colorSpectrum,
      align: this.options.align,
      legendSet,
      theme: this.theme.label,
      labels: this.scaleData.labels
    });
  }

  /**
   * Render legend area.
   * @returns {Array.<object>}
   * @private
   */
  _renderLegendArea() {
    const legendSet = this.paper.set();

    this._renderGraph(legendSet);
    this._renderTickArea(legendSet);

    return legendSet;
  }

  /**
   * Set data for rendering.
   * @param {{
   *      layout: object,
   *      legendScaleData: object
   * }} data - scale data
   * @private
   */
  _setDataForRendering({ layout, paper, legendScaleData }) {
    this.layout = layout;
    this.paper = paper;
    this.scaleData = legendScaleData;
  }

  /**
   * Render legend component.
   * @param {object} data - scale data
   */
  render(data) {
    this._setDataForRendering(data);
    this.legendSet = this._renderLegendArea();
  }

  /**
   * Rerender legend component.
   * @param {object} data - scale data
   */
  rerender(data) {
    this.legendSet.remove();
    this.render(data);
  }

  /**
   * Resize legend component.
   * @param {object} data - scale data
   */
  resize(data) {
    this.rerender(data);
  }

  /**
   * On show wedge.
   * @param {number} ratio ratio
   * @param {string} label label
   */
  onShowWedge(ratio, label) {
    ratio = this.options.reversed ? 1 - ratio : ratio;
    this.graphRenderer.showWedge(ratio, label);
  }

  /**
   * On hide wedge.
   */
  onHideWedge() {
    this.graphRenderer.hideWedge();
  }
}

/**
 * Factory for SpectrumLegend
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
export default function spectrumLegendFactory(params) {
  const isLegendVisible = snippet.isUndefined(params.options.visible)
    ? true
    : params.options.visible;
  const { chartType } = params.chartOptions;
  let spectrumLegend = null;

  if (isLegendVisible) {
    params.chartType = chartType;

    spectrumLegend = new SpectrumLegend(params);
  }

  return spectrumLegend;
}

spectrumLegendFactory.componentType = 'legend';
spectrumLegendFactory.SpectrumLegend = SpectrumLegend;
