/**
 * @fileoverview Series component for rendering graph of treemap chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import Series from './series';
import squarifier from './squarifier';
import labelHelper from './renderingLabelHelper';
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import snippet from 'tui-code-snippet';

class TreemapChartSeries extends Series {
  /**
   * Series component for rendering graph of treemap chart.
   * @constructs TreemapChartSeries
   * @private
   * @param {object} params - parameters
   * @extends Series
   */
  constructor(params) {
    super(params);

    this.theme.borderColor = this.theme.borderColor || chartConst.TREEMAP_DEFAULT_BORDER;
    this.theme.label.color = this.options.useColorValue ? '#000' : '#fff';

    /**
     * root id
     * @type {string}
     */
    this.rootId = chartConst.TREEMAP_ROOT_ID;

    /**
     * start depth of seriesItem for rendering graph
     * @type {number}
     */
    this.startDepth = 1;

    /**
     * selected group
     * @type {null | number}
     */
    this.selectedGroup = null;

    /**
     * bound map
     * @type {null|object.<string, object>}
     */
    this.boundMap = null;

    /**
     * color spectrum
     * @type {ColorSpectrum}
     */
    this.colorSpectrum = params.colorSpectrum;

    this._initOptions();
  }

  /**
   * Initialize options.
   * @private
   */
  _initOptions() {
    this.options.useColorValue = !!this.options.useColorValue;

    if (snippet.isUndefined(this.options.zoomable)) {
      this.options.zoomable = !this.options.useColorValue;
    }

    if (snippet.isUndefined(this.options.useLeafLabel)) {
      this.options.useLeafLabel = !this.options.zoomable;
    }
  }

  /**
   * Make series data.
   * @returns {{
   *      groupBounds: object.<string, {left: number, top: number, width: number, height: number}>,
   *      seriesDataModel: SeriesDataModel
   * }}
   * @private
   * @override
   */
  _makeSeriesData() {
    const boundMap = this._getBoundMap();
    const groupBounds = this._makeBounds(boundMap);

    return {
      boundMap,
      groupBounds,
      seriesDataModel: this._getSeriesDataModel(),
      startDepth: this.startDepth,
      isPivot: true,
      colorSpectrum: this.options.useColorValue ? this.colorSpectrum : null,
      chartBackground: this.chartBackground,
      zoomable: this.options.zoomable,
      isAvailable: () => groupBounds && groupBounds.length > 0
    };
  }

  /**
   * Make bound map by dimension.
   * @param {string | number} parent - parent id
   * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
   * @param {object} layout - layout
   * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
   * @private
   */
  _makeBoundMap(parent, boundMap, layout) {
    const seriesDataModel = this._getSeriesDataModel();
    const defaultLayout = snippet.extend({}, this.layout.dimension, this.layout.position);
    const seriesItems = seriesDataModel.findSeriesItemsByParent(parent);

    layout = layout || defaultLayout;
    boundMap = snippet.extend(boundMap || {}, squarifier.squarify(layout, seriesItems));

    seriesItems.forEach(seriesItem => {
      boundMap = this._makeBoundMap(seriesItem.id, boundMap, boundMap[seriesItem.id]);
    });

    return boundMap;
  }

  /**
   * Make bounds for rendering graph.
   * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
   * @returns {Array.<Array.<{left: number, top: number, width: number, height: number}>>}
   * @private
   */
  _makeBounds(boundMap) {
    const { startDepth } = this;
    const seriesDataModel = this._getSeriesDataModel();
    let isValid;

    if (this.options.zoomable) {
      isValid = seriesItem => seriesItem.depth === startDepth;
    } else {
      isValid = seriesItem => !seriesItem.hasChild;
    }

    return seriesDataModel.map(
      seriesGroup =>
        seriesGroup.map(seriesItem => {
          const bound = boundMap[seriesItem.id];
          let result = null;

          if (bound && isValid(seriesItem)) {
            result = {
              end: bound
            };
          }

          return result;
        }, true),
      true
    );
  }

  /**
   * Get bound map for rendering graph.
   * @returns {object.<string, {left: number, top: number, width: number, height: number}>}
   * @private
   */
  _getBoundMap() {
    if (!this.boundMap) {
      this.boundMap = this._makeBoundMap(this.rootId);
    }

    return this.boundMap;
  }

  /**
   * Whether should dimmed or not.
   * @param {SeriesDataModel} seriesDataModel - SeriesDataModel for treemap
   * @param {SeriesItem} hoverSeriesItem - hover SeriesItem
   * @param {SeriesItem} seriesItem - target SeriesItem
   * @returns {boolean}
   * @private
   */
  _shouldDimmed(seriesDataModel, hoverSeriesItem, seriesItem) {
    let shouldTransparent = false;

    if (
      hoverSeriesItem &&
      seriesItem.id !== hoverSeriesItem.id &&
      seriesItem.group === hoverSeriesItem.group
    ) {
      const parent = seriesDataModel.findParentByDepth(seriesItem.id, hoverSeriesItem.depth + 1);

      if (parent && parent.parent === hoverSeriesItem.id) {
        shouldTransparent = true;
      }
    }

    return shouldTransparent;
  }

  /**
   * Render series label.
   * @param {object} paper - paper
   * @returns {Array.<object>}
   * @private
   */
  _renderSeriesLabel(paper) {
    const seriesDataModel = this._getSeriesDataModel();
    const boundMap = this._getBoundMap();
    const labelTheme = this.theme.label;
    const { labelTemplate } = this.options;
    let seriesItems;

    if (this.options.useLeafLabel) {
      seriesItems = seriesDataModel.findLeafSeriesItems(this.selectedGroup);
    } else {
      seriesItems = seriesDataModel.findSeriesItemsByDepth(this.startDepth, this.selectedGroup);
    }

    const labels = seriesItems.map(seriesItem => {
      const labelText = labelTemplate
        ? labelTemplate(seriesItem.pickLabelTemplateData())
        : seriesItem.label;

      return this.decorateLabel(labelText);
    });

    const positions = labelHelper.boundsToLabelPostionsForTreemap(
      seriesItems,
      boundMap,
      labelTheme
    );

    return this.graphRenderer.renderSeriesLabelForTreemap(paper, positions, labels, labelTheme);
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
   * Zoom.
   * @param {string | number} rootId - root id
   * @param {number} startDepth - start depth
   * @param {number} group - group
   * @private
   */
  _zoom(rootId, startDepth, group) {
    this._clearSeriesContainer();
    this.boundMap = null;
    this.rootId = rootId;
    this.startDepth = startDepth;
    this.selectedGroup = group;
    this._renderSeriesArea(this.paper, snippet.bind(this._renderGraph, this));
    this.animateComponent(true);
  }

  /**
   * Zoom
   * @param {{index: number}} data - data for zoom
   */
  zoom(data) {
    const detectedIndex = data.index;

    this.labelSet.remove();

    if (detectedIndex === -1) {
      this._zoom(chartConst.TREEMAP_ROOT_ID, 1, null);

      return;
    }

    const seriesDataModel = this._getSeriesDataModel();
    const seriesItem = seriesDataModel.getSeriesItem(0, detectedIndex, true);

    if (!seriesItem || !seriesItem.hasChild) {
      return;
    }

    this._zoom(seriesItem.id, seriesItem.depth + 1, seriesItem.group);
    this.eventBus.fire('afterZoom', detectedIndex);
  }

  /**
   * Make exportation data for public event of series type.
   * @param {object} seriesData series data
   * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} export data
   * @private
   */
  _makeExportationSeriesData(seriesData) {
    const { indexes } = seriesData;
    const seriesItem = this._getSeriesDataModel().getSeriesItem(
      indexes.groupIndex,
      indexes.index,
      true
    );

    return snippet.extend({
      chartType: this.chartType,
      indexes: seriesItem.indexes
    });
  }

  /**
   * To call showAnimation function of graphRenderer.
   * @param {{groupIndex: number, index: number}} indexes - indexes
   */
  onHoverSeries(indexes) {
    if (!predicate.isShowLabel(this.options)) {
      return;
    }

    const item = this._getSeriesDataModel().getSeriesItem(indexes.groupIndex, indexes.index, true);
    const ratio = item.colorRatio;

    this.graphRenderer.showAnimation(indexes, this.options.useColorValue, 0.6);

    if (ratio > -1) {
      this.eventBus.fire('showWedge', ratio, item.colorValue);
    }
  }

  /**
   * To call hideAnimation function of graphRenderer.
   * @param {{groupIndex: number, index: number}} indexes - indexes
   */
  onHoverOffSeries(indexes) {
    if (!predicate.isShowLabel(this.options) || !indexes) {
      return;
    }

    this.graphRenderer.hideAnimation(indexes, this.options.useColorValue);
  }
}

/**
 * treemapChartSeriesFactory
 * @param {object} params chart options
 * @returns {object} treemap series instance
 * @ignore
 */
export default function treemapChartSeriesFactory(params) {
  params.libType = params.chartOptions.libType;
  params.chartType = 'treemap';
  params.chartBackground = params.chartTheme.chart.background;

  return new TreemapChartSeries(params);
}

treemapChartSeriesFactory.componentType = 'series';
treemapChartSeriesFactory.TreemapChartSeries = TreemapChartSeries;
