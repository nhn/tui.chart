/**
 * @fileoverview Tooltip component for map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import TooltipBase from './tooltipBase';
import singleTooltipMixer from './singleTooltipMixer';
import tooltipTemplate from './tooltipTemplate';
import snippet from 'tui-code-snippet';

/**
 * @classdesc MapChartTooltip component.
 * @class MapChartTooltip
 * @private
 */
class MapChartTooltip extends TooltipBase {
  /**
   * Map chart tooltip component.
   * @constructs MapChartTooltip
   * @private
   * @override
   */
  constructor(params) {
    super(params);
    /**
     * Map model
     * @type {MapChartMapModel}
     */
    this.mapModel = params.mapModel;

    /**
     * Color spectrum
     * @type {ColorSpectrum}
     */
    this.colorSpectrum = params.colorSpectrum;
  }

  /**
   * Make tooltip html.
   * @param {{name: string, value: number}} datum tooltip datum
   * @returns {string} tooltip html
   * @private
   */
  _makeTooltipHtml(datum) {
    return tooltipTemplate.tplMapChartDefault(datum);
  }

  /**
   * Make single tooltip html.
   * @param {string} chartType chart type
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @returns {string} tooltip html
   * @private
   */
  _makeSingleTooltipHtml(chartType, indexes) {
    const datum = this.mapModel.getDatum(indexes.index);
    const suffix = this.options.suffix ? ` ${this.options.suffix}` : '';

    return this.templateFunc({
      name: datum.name || datum.code,
      value: datum.label,
      suffix,
      cssText: `background-color: ${this.colorSpectrum.getColor(datum.ratio)}`
    });
  }

  /**
   * Make parameters for show tooltip user event.
   * @param {{groupIndex: number, index: number}} indexes indexes
   * @param {object} additionParams addition parameters
   * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip
   * @private
   */
  _makeShowTooltipParams(indexes, additionParams) {
    const datum = this.mapModel.getDatum(indexes.index);
    const params = snippet.extend(
      {
        chartType: this.chartType,
        code: datum.code,
        name: datum.name,
        value: datum.label,
        index: indexes.index
      },
      additionParams
    );

    return params;
  }

  /**
   * Set default align option of tooltip.
   * @private
   * @override
   */
  _setDefaultTooltipPositionOption() {
    if (!this.options.align) {
      this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;
    }
  }
}

singleTooltipMixer.mixin(MapChartTooltip);

/**
 * mapChartTooltipFactory
 * @param {object} params chart options
 * @returns {object} mapChart tooptip instance
 * @ignore
 */
export default function mapChartTooltipFactory(params) {
  return new MapChartTooltip(params);
}

mapChartTooltipFactory.componentType = 'tooltip';
