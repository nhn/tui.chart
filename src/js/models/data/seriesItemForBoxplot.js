/**
 * @fileoverview SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import renderUtil from '../../helpers/renderUtil';
import calculator from '../../helpers/calculator';
import snippet from 'tui-code-snippet';

class SeriesItem {
  /**
   * SeriesItem is a element of SeriesGroup.items.
   * SeriesItem has processed terminal data like value, ratio, etc.
   * @constructs SeriesItem
   * @private
   * @param {object} params - parameters
   *      @param {number} params.datum - value
   *      @param {string} params.chartType - type of chart
   *      @param {?Array.<function>} params.formatFunctions - format functions
   *      @param {number} params.index - raw data index
   *      @param {?string} params.stack - stack
   */
  constructor(params) {
    /**
     * type of chart
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * format functions
     * @type {Array.<function>}
     */
    this.formatFunctions = params.formatFunctions;

    /**
     * value of item
     * @type {number}
     */
    this.value = null;

    /**
     * label
     * @type {string}
     */
    this.label = null;

    /**
     * ratio of value about distance of limit
     * @type {number}
     */
    this.ratio = null;

    /**
     * min value of item.
     * @type {number}
     */
    this.min = null;

    /**
     * min label
     * @type {number}
     */
    this.minLabel = null;

    /**
     * ratio of end value
     * @type {number}
     */
    this.minRatio = null;

    /**
     * max value of item.
     * @type {number}
     */
    this.max = null;

    /**
     * max label
     * @type {number}
     */
    this.maxLabel = null;

    /**
     * ratio of max value
     * @type {number}
     */
    this.maxRatio = null;

    /**
     * median value of item.
     * @type {number}
     */
    this.median = null;

    /**
     * median label
     * @type {number}
     */
    this.medianLabel = null;

    /**
     * ratio of median value
     * @type {number}
     */
    this.medianRatio = null;

    /**
     * lq value of item.
     * @type {number}
     */
    this.lq = null;

    /**
     * lq label
     * @type {number}
     */
    this.lqLabel = null;

    /**
     * ratio of lq value
     * @type {number}
     */
    this.lqRatio = null;

    /**
     * uq value of item.
     * @type {number}
     */
    this.uq = null;

    /**
     * uq label
     * @type {number}
     */
    this.uqLabel = null;

    /**
     * ratio of uq value
     * @type {number}
     */
    this.uqRatio = null;

    /**
     * distance of start ratio and end ratio
     * @type {null}
     */
    this.ratioDistance = null;

    /**
     * series legend name
     * @type {string}
     */
    this.legendName = params.legendName;

    this._initValues(params.datum, params.index);
  }

  /**
   * Initialize values of item.
   * @param {number|Array.<number>} rawValue - raw value
   * @param {number} index - raw data index
   * @private
   */
  _initValues(rawValue, index) {
    const values = this._createValues(rawValue);
    const [min, lq, median, uq, max] = values;
    const hasOutlier = values.length > 5;
    let outliers;
    const formatValue = value =>
      renderUtil.formatValue({
        value,
        formatFunctions: this.formatFunctions,
        chartType: this.chartType,
        areaType: 'makingSeriesLabel',
        legendName: this.legendName
      });

    this.value = this.max = max;
    this.uq = uq;
    this.median = median;
    this.lq = lq;
    this.min = min;
    this.index = index;

    if (hasOutlier) {
      this.outliers = [];

      ({ outliers } = this);

      values.slice(5).forEach(outlier => {
        outliers.push({
          value: outlier,
          label: formatValue(outlier)
        });
      });
    }

    this.label = formatValue(max);
    this.uqLabel = formatValue(uq);
    this.medianLabel = formatValue(median);
    this.lqLabel = formatValue(lq);
    this.minLabel = formatValue(min);

    this.maxLabel = this.label;
  }

  /**
   * Crete sorted values.
   * @param {Array.<number>|number} value value
   * @returns {Array.<number>}
   * @private
   */
  _createValues(value) {
    return []
      .concat(value)
      .map(newValue => (snippet.isNull(newValue) ? null : parseFloat(newValue)));
  }

  /**
   * Add min.
   * @param {number} value - value
   * @private
   */
  addStart(value) {
    if (!snippet.isNull(this.min)) {
      return;
    }

    this.min = value;
    this.minLabel = renderUtil.formatValue({
      value,
      formatFunctions: this.formatFunctions,
      chartType: this.chartType,
      areaType: 'series',
      legendName: this.legendName
    });
  }

  /**
   * Update formatted value for range.
   * @private
   */
  _updateFormattedValueforRange() {
    this.label = `${this.minLabel}~${this.maxLabel}`;
  }

  /**
   * Add ratio.
   * @param {number} divNumber - number for division
   * @param {?number} subNumber - number for subtraction
   * @param {?number} baseRatio - base ratio
   */
  addRatio(divNumber = 1, subNumber = 0, baseRatio = 1) {
    const { calculateRatio } = calculator;

    this.ratio = this.maxRatio = calculateRatio(this.max, divNumber, subNumber, baseRatio);
    this.uqRatio = calculateRatio(this.uq, divNumber, subNumber, baseRatio);
    this.medianRatio = calculateRatio(this.median, divNumber, subNumber, baseRatio);
    this.lqRatio = calculateRatio(this.lq, divNumber, subNumber, baseRatio);
    this.minRatio = calculateRatio(this.min, divNumber, subNumber, baseRatio);

    (this.outliers || []).forEach(outlier => {
      outlier.ratio = calculateRatio(outlier.value, divNumber, subNumber, baseRatio);
    });

    this.ratioDistance = Math.abs(this.uqRatio - this.lqRatio);
  }

  /**
   * Get formatted value for tooltip.
   * @param {string} valueType - value type
   * @returns {string}
   * @private
   */
  _getFormattedValueForTooltip(valueType) {
    return renderUtil.formatValue({
      value: this[valueType],
      formatFunctions: this.formatFunctions,
      chartType: this.chartType,
      areaType: 'tooltip',
      valueType,
      legendName: this.legendName
    });
  }

  /**
   * Pick value map for tooltip.
   * @returns {{value: number, min: ?number, max: ?number}}
   */
  pickValueMapForTooltip() {
    const valueMap = {
      value: this._getFormattedValueForTooltip('value'),
      ratio: this.ratio
    };

    if (snippet.isExisty(this.min)) {
      valueMap.min = this._getFormattedValueForTooltip('min');
      valueMap.max = this._getFormattedValueForTooltip('max');
      valueMap.minRatio = this.minRatio;
      valueMap.maxRatio = this.maxRatio;
      valueMap.maxLabel = this.maxLabel;
      valueMap.minLabel = this.minLabel;
      valueMap.uqLabel = this.uqLabel;
      valueMap.lqLabel = this.lqLabel;
      valueMap.medianLabel = this.medianLabel;
      valueMap.outliers = this.outliers;
    }

    return valueMap;
  }
}

export default SeriesItem;
