/**
 * @fileoverview SeriesItem for treemap.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import calculator from '../../helpers/calculator';
import renderUtil from '../../helpers/renderUtil';
import snippet from 'tui-code-snippet';

class SeriesItemForTreemap {
  /**
   * SeriesItem for treemap.
   * @constructs SeriesItemForTreemap
   * @private
   * @param {object} rawSeriesDatum - value
   * @param {?Array.<function>} formatFunctions - format functions
   * @param {string} chartType - type of chart
   */
  constructor(rawSeriesDatum, formatFunctions, chartType) {
    /**
     * type of chart
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * format functions
     * @type {Array.<function>}
     */
    this.formatFunctions = formatFunctions;
    this.id = rawSeriesDatum.id;
    this.parent = rawSeriesDatum.parent;
    this.value = rawSeriesDatum.value;
    this.ratio = rawSeriesDatum.ratio;
    this.colorValue = rawSeriesDatum.colorValue;
    this.depth = rawSeriesDatum.depth;
    this.label = rawSeriesDatum.label || '';
    this.group = rawSeriesDatum.group;
    this.hasChild = !!rawSeriesDatum.hasChild;
    this.indexes = rawSeriesDatum.indexes;
    this.fillOpacity = rawSeriesDatum.fillOpacity;
  }

  /**
   * Add ratio.
   * @param {number} divNumber - number for division
   * @param {?number} subNumber - number for subtraction
   */
  addRatio(divNumber = 1, subNumber = 0) {
    this.colorRatio = calculator.calculateRatio(this.colorValue, divNumber, subNumber, 1) || -1;
  }

  /**
   * Pick value map for tooltip.
   * @returns {{value: number, label: string}}
   */
  pickValueMapForTooltip() {
    const { formatFunctions, chartType, colorValue } = this;
    const formattedValue = renderUtil.formatValue({
      value: this.value,
      formatFunctions,
      chartType,
      areaType: 'tooltipValue'
    });
    const label = formattedValue;
    const valueMap = {
      legend: this.label || '',
      value: formattedValue,
      label,
      ratio: this.ratio,
      tooltipColorIndex: this.indexes[0]
    };

    if (snippet.isExisty(colorValue)) {
      valueMap.colorValue = renderUtil.formatValue({
        value: colorValue,
        formatFunctions,
        chartType,
        areaType: 'tooltipColorValue'
      });
      valueMap.colorRatio = this.colorRatio;
    }

    return valueMap;
  }

  /**
   * Pick data for label template.
   * @returns {{value: number, ratio: number, label: string, colorValue: ?number, colorValueRatio: ?number}}
   */
  pickLabelTemplateData() {
    const templateData = {
      value: this.value,
      ratio: this.ratio,
      label: this.label
    };

    if (snippet.isExisty(this.colorValue)) {
      templateData.colorValue = this.colorValue;
      templateData.colorValueRatio = this.ratio;
    }

    return templateData;
  }
}

export default SeriesItemForTreemap;
