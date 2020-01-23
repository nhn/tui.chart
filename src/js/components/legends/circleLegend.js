/**
 * @fileoverview  Circle legend component render a legend in the form of overlapping circles
 *                  by representative radius values.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import pluginFactory from '../../factories/pluginFactory';
import snippet from 'tui-code-snippet';

class CircleLegend {
  /**
   * Circle legend component render a legend in the form of overlapping circles by representative radius values.
   * @constructs CircleLegend
   * @private
   * @param {object} params parameters
   *      @param {?string} params.libType - library type for graph rendering
   *      @param {string} params.chartType - chart type
   *      @param {DataProcessor} params.dataProcessor - DataProcessor
   *      @param {string} params.baseFontFamily - base fontFamily of chart
   */
  constructor({ libType, chartType, dataProcessor, baseFontFamily }) {
    /**
     * ratios for rendering circle
     * @type {Array.<number>}
     */
    this.circleRatios = [1, 0.5, 0.25];

    /**
     * chart type
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = dataProcessor;

    /**
     * theme for label of circle legend area
     * @type {{fontSize: number, fontFamily: *}}
     */
    this.labelTheme = {
      fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
      fontFamily: baseFontFamily
    };

    /**
     * Graph renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(libType, 'circleLegend');

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
     */
    this.layout = null;

    /**
     * max radius for rendering circle legend
     * @type {null|number}
     */
    this.maxRadius = null;

    this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Format label.
   * @param {number} label - label
   * @param {number} decimalLength - decimal length
   * @returns {string}
   * @private
   */
  _formatLabel(label, decimalLength) {
    const formatFunctions = this.dataProcessor.getFormatFunctions();
    let formattedLabel;

    if (decimalLength === 0) {
      formattedLabel = String(parseInt(label, 10));
    } else {
      formattedLabel = renderUtil.formatToDecimal(String(label), decimalLength);
    }

    return renderUtil.formatValue({
      value: formattedLabel,
      formatFunctions,
      chartType: this.chartType,
      areaType: 'circleLegend',
      valueType: 'r'
    });
  }

  /**
   * Make label html.
   * @returns {Array.<string>}
   * @private
   */
  _makeLabels() {
    const maxValueRadius = this.dataProcessor.getMaxValue(this.chartType, 'r');
    const decimalLength = calculator.getDecimalLength(maxValueRadius);

    return this.circleRatios.map(ratio => this._formatLabel(maxValueRadius * ratio, decimalLength));
  }

  /**
   * Render for circle legend area.
   * @param {object} paper paper object
   * @returns {Array.<object>}
   * @private
   */
  _render(paper) {
    return this.graphRenderer.render(
      paper,
      this.layout,
      this.maxRadius,
      this.circleRatios,
      this._makeLabels()
    );
  }

  /**
   * Set data for rendering.
   * @param {{
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      },
   *      maxRadius: number
   * }} data - bounds data
   * @private
   */
  _setDataForRendering(data) {
    this.layout = data.layout;
    this.maxRadius = data.maxRadius;
  }

  /**
   * Render.
   * @param {object} data - bounds data
   */
  render(data) {
    this._setDataForRendering(data);
    this.circleLegendSet = this._render(data.paper);
  }

  /**
   * Rerender.
   * @param {object} data - bounds data
   */
  rerender(data) {
    this.circleLegendSet.remove();

    this._setDataForRendering(data);
    this.circleLegendSet = this._render(data.paper);
  }

  /**
   * Resize.
   * @param {object} data - bounds data
   */
  resize(data) {
    this.rerender(data);
  }
}

/**
 * Factory for CircleLegend
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
export default function circleLegendFactory(params) {
  const {
    chartTheme,
    chartOptions: { chartType }
  } = params;
  const visibleOption = snippet.pick(params.chartOptions, 'circleLegend', 'visible');
  let circleLegend = null;
  let isLegendVisible;

  if (snippet.isUndefined(visibleOption)) {
    isLegendVisible = true;
  } else {
    isLegendVisible = visibleOption;
  }

  if (isLegendVisible) {
    params.chartType = chartType;
    params.baseFontFamily = chartTheme.chart.fontFamily;

    circleLegend = new CircleLegend(params);
  }

  return circleLegend;
}

circleLegendFactory.componentType = 'legend';
circleLegendFactory.CircleLegend = CircleLegend;
