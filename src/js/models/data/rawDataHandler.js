/**
 * @fileoverview Raw data handler.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import chartConst from '../../const';
import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

/**
 * Raw data Handler.
 * @module rawDataHandler
 * @private */
export default {
  /**
   * Pick stacks.
   * @param {Array.<{stack: string}>} seriesData - raw series data
   * @param {boolean} [divergingOption] - diverging option
   * @returns {Array.<string>} stacks
   */
  pickStacks(seriesData, divergingOption) {
    const stacks = seriesData.map(seriesDatum => seriesDatum.stack);

    let uniqStacks = arrayUtil.unique(stacks);

    if (divergingOption) {
      uniqStacks = uniqStacks.slice(0, 2);
    }

    const filteredStack = uniqStacks.filter(stack => !!stack);

    if (filteredStack.length < uniqStacks.length) {
      filteredStack.push(chartConst.DEFAULT_STACK);
    }

    return filteredStack;
  },

  /**
   * Sort series data from stacks.
   * @param {Array.<{stack: ?string}>} seriesData series data
   * @param {Array.<string>} stacks stacks
   * @returns {Array}
   * @private
   */
  _sortSeriesData(seriesData, stacks) {
    let newSeriesData = [];

    if (!stacks) {
      stacks = this.pickStacks(seriesData);
    }

    stacks.forEach(stack => {
      const filtered = seriesData.filter(
        datum => (datum.stack || chartConst.DEFAULT_STACK) === stack
      );
      newSeriesData = newSeriesData.concat(filtered);
    });

    return newSeriesData;
  },

  /**
   * Remove stack of series data.
   * @param {Array.<{stack: ?string}>} seriesData series data
   */
  removeSeriesStack(seriesData) {
    Object.values(seriesData).forEach(datum => {
      delete datum.stack;
    });
  },

  /**
   * Find char type from chart name.
   * @param {object.<string, string>} seriesAlias - alias map
   * @param {string} seriesType - series name
   * @returns {*}
   */
  findChartType(seriesAlias, seriesType) {
    let chartType;

    if (seriesAlias) {
      chartType = seriesAlias[seriesType];
    }

    return chartType || seriesType;
  },

  /**
   * Get chart type map.
   * @param {{series: (Array | object)}} rawData - raw data
   * @returns {object.<string, string>}
   */
  getChartTypeMap(rawData) {
    const chartTypeMap = {};

    if (snippet.isObject(rawData.series)) {
      snippet.forEach(rawData.series, (data, seriesType) => {
        chartTypeMap[this.findChartType(rawData.seriesAlias, seriesType)] = true;
      });
    }

    return chartTypeMap;
  },

  /**
   * Create minus values.
   * @param {Array.<number>} data number data
   * @returns {Array} minus values
   * @private
   */
  _createMinusValues(data) {
    return data.map(value => (value < 0 ? 0 : -value));
  },

  /**
   * Create plus values.
   * @param {Array.<number>} data number data
   * @returns {Array} plus values
   * @private
   */
  _createPlusValues(data) {
    return data.map(value => (value < 0 ? 0 : value));
  },

  /**
   * Make normal diverging raw series data.
   * @param {{data: Array.<number>}} rawSeriesData raw series data
   * @returns {{data: Array.<number>}} changed raw series data
   * @private
   */
  _makeNormalDivergingRawSeriesData(rawSeriesData) {
    rawSeriesData.length = Math.min(rawSeriesData.length, 2);

    rawSeriesData[0].data = this._createMinusValues(rawSeriesData[0].data);

    if (rawSeriesData[1]) {
      rawSeriesData[1].data = this._createPlusValues(rawSeriesData[1].data);
    }

    return rawSeriesData;
  },

  /**
   * Make raw series data for stacked diverging option.
   * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
   * @returns {{data: Array.<number>}} changed raw series data
   * @private
   */
  _makeRawSeriesDataForStackedDiverging(rawSeriesData) {
    const stacks = this.pickStacks(rawSeriesData, true);
    const result = [];
    const [leftStack, rightStack] = stacks;

    rawSeriesData = this._sortSeriesData(rawSeriesData, stacks);

    rawSeriesData.forEach(seriesDatum => {
      const stack = seriesDatum.stack || chartConst.DEFAULT_STACK;
      if (stack === leftStack) {
        seriesDatum.data = this._createMinusValues(seriesDatum.data);
        result.push(seriesDatum);
      } else if (stack === rightStack) {
        seriesDatum.data = this._createPlusValues(seriesDatum.data);
        result.push(seriesDatum);
      }
    });

    return result;
  },

  /**
   * Make raw series data for diverging.
   * @param {{data: Array.<number>, stack: string}} rawSeriesData raw series data
   * @param {?string} stackTypeOption stackType option
   * @returns {{data: Array.<number>}} changed raw series data
   * @private
   */
  _makeRawSeriesDataForDiverging(rawSeriesData, stackTypeOption) {
    if (predicate.isValidStackOption(stackTypeOption)) {
      rawSeriesData = this._makeRawSeriesDataForStackedDiverging(rawSeriesData);
    } else {
      rawSeriesData = this._makeNormalDivergingRawSeriesData(rawSeriesData);
    }

    return rawSeriesData;
  },

  /**
   * Update raw series data by options.
   * @param {object} rawData - raw data
   * @param {{stackType: ?string, diverging: ?boolean}} seriesOptions - series options
   */
  updateRawSeriesDataByOptions(rawData, seriesOptions = {}) {
    if (predicate.isValidStackOption(seriesOptions.stackType)) {
      Object.keys(rawData.series).forEach(seriesType => {
        rawData.series[seriesType] = this._sortSeriesData(rawData.series[seriesType]);
      });
    }

    if (seriesOptions.diverging) {
      Object.entries(rawData.series).forEach(([seriesType, seriesDatum]) => {
        rawData.series[seriesType] = this._makeRawSeriesDataForDiverging(
          seriesDatum,
          seriesOptions.stackType
        );
      });
    }
  },

  /**
   * Append outlier value to boxplot series data end
   * @param {object} rawData - raw data
   */
  appendOutliersToSeriesData(rawData) {
    const { boxplot } = rawData.series;
    boxplot.forEach(seriesItem => {
      const { outliers } = seriesItem;
      if (outliers && outliers.length) {
        outliers.forEach(outlier => {
          seriesItem.data[outlier[0]].push(outlier[1]);
        });
      }
    });
  },

  /**
   * Filter raw data belong to checked legend.
   * @param {object} rawData raw data
   * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
   * @returns {object} rawData
   */
  filterCheckedRawData(rawData, checkedLegends) {
    const cloneData = JSON.parse(JSON.stringify(rawData));

    if (checkedLegends) {
      Object.entries(cloneData.series).forEach(([chartType, serieses]) => {
        if (!checkedLegends[chartType]) {
          cloneData.series[chartType] = [];
        } else if (checkedLegends[chartType].length) {
          cloneData.series[chartType] = serieses.filter(
            (series, index) => checkedLegends[chartType][index]
          );
        }
      });
    }

    if (cloneData.series.bullet) {
      const filteredCategories = [];
      checkedLegends.bullet.forEach((isChecked, index) => {
        if (isChecked) {
          filteredCategories.push(rawData.categories[index]);
        }
      });
      cloneData.categories = filteredCategories;
    }

    return cloneData;
  },

  /**
   * Modify rawData to fit chart format
   * @param {object} rawData - raw data
   * @private
   */
  _makeRawSeriesDataForBulletChart(rawData) {
    const { bullet = [] } = rawData.series;

    rawData.categories = rawData.categories || [];
    rawData.categories = bullet.map(seriesData => seriesData.name || '');
  }
};
