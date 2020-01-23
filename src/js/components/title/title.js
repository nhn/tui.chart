/**
 * @fileoverview  Title component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import chartConst from '../../const';
import pluginFactory from '../../factories/pluginFactory';

class Title {
  /**
   * Title component.
   * @constructs Title
   * @param {object} params parameters
   *      @param {object} params.bound title bound
   *      @param {object} params.theme title theme
   *      @param {object} params.options title options
   *      @param {object} params.text title text content
   * @ignore
   */
  constructor(params) {
    /**
     * Theme
     * @type {object}
     */
    this.theme = params.theme || {};

    /**
     * Title text content
     * @type {string}
     */
    this.titleText = params.text;

    /**
     * Relative offset position
     * @type {object}
     */
    this.offset = params.offset;

    /**
     * title align option
     * @type {object}
     */
    this.align = params.align;

    /**
     * Graph renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(chartConst.COMPONENT_TYPE_RAPHAEL, 'title');

    /**
     * Drawing type
     * @type {string}
     */
    this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Render title component
   * @param {object} data data for render title
   */
  render(data) {
    this.titleSet = this._renderTitleArea(data);
  }

  /**
   * Render title component
   * @param {object} data data for render title
   */
  resize(data) {
    const { dimensionMap } = data;
    const legendWidth = dimensionMap.legend ? dimensionMap.legend.width : 0;
    const width = dimensionMap.series.width + legendWidth;

    this.graphRenderer.resize(width, this.titleSet);
  }

  /**
   * Render title component
   * @param {object} data data for render title
   */
  rerender(data) {
    this.titleSet.remove();

    this.render(data);
  }

  /**
   * Render title on given paper
   * @param {object} data data for render title
   * @returns {object} raphael paper
   * @private
   */
  _renderTitleArea(data) {
    const { paper, dimensionMap } = data;
    const chartTitleAreaWidth = this._calculateForTitleAreaWidth(dimensionMap);

    return this.graphRenderer.render({
      paper,
      titleText: this.titleText,
      offset: this.offset,
      theme: this.theme,
      align: this.align,
      chartTitleAreaWidth
    });
  }

  /**
   * Calculate title area width
   * @param {object} dimensionMap dimensionMap
   *     @param {object} dimensionMap.chartExportMenu dimension of chartExportMenu
   *     @param {object} dimensionMap.chart chart of chartExportMenu
   * @returns {number} title area width
   * @private
   */
  _calculateForTitleAreaWidth({ chartExportMenu, chart }) {
    const exportMenuWidth = chartExportMenu ? chartExportMenu.width * 2 : 0;

    return chart.width - exportMenuWidth;
  }
}

/**
 * Factory for Title
 * @param {object} param parameter
 * @returns {object|null}
 * @ignore
 */
export default function titleFactory(param) {
  const options = param.chartOptions.chart || { title: {} };
  let title = null;

  if (options.title && options.title.text) {
    param.text = options.title.text;
    param.offset = options.title.offset;
    param.align = options.title.align;

    title = new Title(param);
  }

  return title;
}

titleFactory.componentType = 'title';
titleFactory.Title = Title;
