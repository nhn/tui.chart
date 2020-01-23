/**
 * @fileoverview LegendModel is a model for legend area(checkbox, icon, label text)
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';

class LegendModel {
  /**
   * LegendModel is legend model.
   * @constructs LegendModel
   * @private
   * @param {object} params parameters
   *      @param {number} params.labels legend labels
   *      @param {object} params.bound axis bound
   *      @param {object} params.theme axis theme
   */
  constructor(params) {
    /**
     * legend theme
     * @type {Object}
     */
    this.theme = params.theme;

    /**
     * legend labels
     * @type {Array.<string> | {column: ?Array.<string>, line: ?Array.<string>}}
     */
    this.labels = params.labels;

    /**
     * label infos
     * @type {Array.<{chartType: string, label: string, index: number}>}
     */
    this.legendData = params.legendData;

    /**
     * chart types
     * @type {?Array.<string>}
     */
    this.seriesTypes = params.seriesTypes || [];

    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * Legend data
     * @type {?Array}
     */
    this.data = null;

    /**
     * Selected legend index.
     * @type {?number}
     */
    this.selectedIndex = null;

    /**
     * sending data to series
     * @type {object}
     */
    this.checkedIndexesMap = {};

    /**
     * checked indexes
     * @type {Array}
     */
    this.checkedWholeIndexes = [];

    this._setData();
    this._initCheckedIndexes();
  }

  /**
   * Initialize checked data.
   * @private
   */
  _initCheckedIndexes() {
    const checkedIndexes = [];
    this.legendData.forEach(({ visible }, index) => {
      if (visible) {
        checkedIndexes.push(index);
      }
      this.checkedWholeIndexes[index] = visible;
    });

    this.updateCheckedLegendsWith(checkedIndexes);
  }

  /**
   * Set theme to legend data.
   * @param {Array.<object>} legendData - legend data
   * @param {{
   *     colors: Array.<string>,
   *     borderColor: ?string
   *     }} colorTheme - legend theme
   * @param {Array.<boolean>} [checkedIndexes] - checked indexes
   * @private
   */
  _setThemeToLegendData(legendData, { colors, borderColor }, checkedIndexes) {
    let seriesIndex = 0;

    legendData.forEach((datum, index) => {
      const itemTheme = {
        color: colors[index]
      };

      if (borderColor) {
        itemTheme.borderColor = borderColor;
      }

      datum.theme = itemTheme;
      datum.index = index;

      if (!checkedIndexes || !snippet.isUndefined(checkedIndexes[index])) {
        datum.seriesIndex = seriesIndex;
        seriesIndex += 1;
      } else {
        datum.seriesIndex = -1;
      }
    });
  }

  /**
   * Set legend data.
   * @private
   */
  _setData() {
    const { theme, chartType, seriesTypes, legendData, checkedIndexesMap } = this;
    let data;

    if (!seriesTypes || seriesTypes.length < 2) {
      this._setThemeToLegendData(legendData, theme[chartType], checkedIndexesMap[chartType]);
      data = legendData;
    } else {
      let startIndex = 0;
      const dataItems = seriesTypes.map(seriesType => {
        const labelLen = this.labels[seriesType].length;
        const endIndex = startIndex + labelLen;
        const slicedLegendData = legendData.slice(startIndex, endIndex);
        const checkedIndexes = checkedIndexesMap[seriesType];

        startIndex = endIndex;
        this._setThemeToLegendData(slicedLegendData, theme[seriesType], checkedIndexes);

        return slicedLegendData;
      });
      data = [].concat(...dataItems);
    }

    this.data = data;
  }

  /**
   * Get legend data.
   * @returns {Array.<{chartType: string, label: string, theme: object}>} legend data
   */
  getData() {
    return this.data;
  }

  /**
   * Get legend datum by index.
   * @param {number} index legend index
   * @returns {{chartType: string, label: string, theme: object}} legend datum
   */
  getDatum(index) {
    return this.data[index];
  }

  /**
   * Get legend datum by label
   * @param {string} label - legend label
   * @returns {{chartType: string, label: string, theme: object}} legend datum
   */
  getDatumByLabel(label) {
    let foundDatum = null;
    this.data.forEach(datum => {
      if (datum.label === label) {
        foundDatum = datum;
      }

      return !foundDatum;
    });

    return foundDatum;
  }

  /**
   * Get selected datum.
   * @returns {{chartType: string, label: string, theme: Object}} legend datum
   */
  getSelectedDatum() {
    return this.getDatum(this.selectedIndex);
  }

  /**
   * Update selected index.
   * @param {?number} value value
   */
  updateSelectedIndex(value) {
    this.selectedIndex = value;
  }

  /**
   * Toggle selected index.
   * @param {number} index legend index
   */
  toggleSelectedIndex(index) {
    let selectedIndex;

    if (this.selectedIndex === index) {
      selectedIndex = null;
    } else {
      selectedIndex = index;
    }

    this.updateSelectedIndex(selectedIndex);
  }

  /**
   * Get selected index.
   * @returns {number} selected index
   */
  getSelectedIndex() {
    return this.selectedIndex;
  }

  /**
   * Whether unselected index or not.
   * @param {number} index legend index
   * @returns {boolean} true if selected
   */
  isUnselectedIndex(index) {
    return !snippet.isNull(this.selectedIndex) && this.selectedIndex !== index;
  }

  /**
   * Whether checked selected index or not.
   * @returns {boolean} true if checked
   */
  isCheckedSelectedIndex() {
    return this.isCheckedIndex(this.selectedIndex);
  }

  /**
   * Toggle checked index.
   * @param {number} index legend index
   */
  toggleCheckedIndex(index) {
    this.checkedWholeIndexes[index] = !this.checkedWholeIndexes[index];
  }

  /**
   * Update checked index.
   * @param {number} index legend index
   * @private
   */
  _updateCheckedIndex(index) {
    this.checkedWholeIndexes[index] = true;
  }

  /**
   * Whether checked index.
   * @param {number} index legend index
   * @returns {boolean} true if checked
   */
  isCheckedIndex(index) {
    return !!this.checkedWholeIndexes[index];
  }

  /**
   * Add sending datum.
   * @param {number} index legend index
   * @private
   */
  _addSendingDatum(index) {
    const legendDatum = this.getDatum(index);
    const { chartType, index: chartIndex } = legendDatum;

    if (!this.checkedIndexesMap[chartType]) {
      this.checkedIndexesMap[chartType] = new Array(this.labels[chartType].length).fill(false);
    }
    this.checkedIndexesMap[chartType][chartIndex] = true;
  }

  /**
   * Check selected index;
   */
  checkSelectedIndex() {
    this._updateCheckedIndex(this.selectedIndex);
    this._addSendingDatum(this.selectedIndex);
    this._setData();
  }

  /**
   * Get checked indexes.
   * @returns {object} object data that whether series has checked or not
   */
  getCheckedIndexes() {
    return Object.keys(this.checkedIndexesMap).reduce((booleanizeObject, chartType) => {
      booleanizeObject[chartType] = Array.from(
        this.checkedIndexesMap[chartType],
        checked => !!checked
      );

      return booleanizeObject;
    }, {});
  }

  /**
   * Reset checked data.
   * @private
   */
  _resetCheckedData() {
    this.checkedWholeIndexes = [];
    this.checkedIndexesMap = {};
  }

  /**
   * Update checked legend's indexes
   * @param {Array.<number>} indexes indexes
   */
  updateCheckedLegendsWith(indexes) {
    this._resetCheckedData();
    indexes.forEach(index => {
      this._updateCheckedIndex(index);
      this._addSendingDatum(index);
    });
    this._setData();
  }
}

export default LegendModel;
