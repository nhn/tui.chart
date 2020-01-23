/**
 * @fileoverview SeriesDataModelForBoxplot is boxplot series model for drawing graph of chart series area,
 *                  and create from rawSeriesData by user,
 * SeriesDataModel.groups has SeriesGroups.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

/*
 * Raw series datum.
 * @typedef {{name: ?string, data: Array.<number>, stack: ?string}} rawSeriesDatum
 */

/*
 * Raw series data.
 * @typedef {Array.<rawSeriesDatum>} rawSeriesData
 */

/*
 * Groups.
 * @typedef {Array.<SeriesGroup>} groups
 */

/*
 * SeriesGroup is a element of SeriesDataModel.groups.
 * SeriesGroup.items has SeriesItem.
 */

/*
 * SeriesItem is a element of SeriesGroup.items.
 * SeriesItem has processed terminal data like value, ratio, etc.
 */

import SeriesItemForBoxplot from './seriesItemForBoxplot';
import SeriesDataModel from './seriesDataModel';
import snippet from 'tui-code-snippet';

const { concat } = Array.prototype;

class SeriesDataModelForBoxplot extends SeriesDataModel {
  /**
   * SeriesDataModelForBoxplot is series model for boxplot chart
   * SeriesDataModel.groups has SeriesGroups.
   * @constructs SeriesDataModel
   * @param {rawSeriesData} rawSeriesData - raw series data
   * @param {string} chartType - chart type
   * @param {object} options - options
   * @param {Array.<function>} formatFunctions - format functions
   * @private
   */
  constructor(rawSeriesData, chartType, options, formatFunctions) {
    super();

    /**
     * chart type
     * @type {string}
     */
    this.chartType = chartType;

    /**
     * chart options
     * @type {Object}
     */
    this.options = options || {};

    /**
     * functions for formatting
     * @type {Array.<function>}
     */
    this.formatFunctions = formatFunctions;

    /**
     * rawData.series
     * @type {rawSeriesData}
     */
    this.rawSeriesData = rawSeriesData || [];

    /**
     * baseGroups is base data for making SeriesGroups.
     * SeriesGroups is made by pivoted baseGroups, lf line type chart.
     * @type {Array.Array<SeriesItem>}
     */
    this.baseGroups = null;

    /**
     * groups has SeriesGroups.
     * @type {Array.<SeriesGroup>}
     */
    this.groups = null;

    this.options.series = this.options.series || {};

    /**
     * map of values by value type like value, x, y, r.
     * @type {object.<string, Array.<number>>}
     */
    this.valuesMap = {};
  }

  /**
   * Create base groups.
   * Base groups is two-dimensional array by seriesItems.
   * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
   * @private
   * @override
   */
  _createBaseGroups() {
    const { chartType, formatFunctions } = this;

    return this.rawSeriesData.map(rawDatum => {
      const data = snippet.isArray(rawDatum) ? rawDatum : [].concat(rawDatum.data);
      const items = data.map(
        (datum, index) =>
          new SeriesItemForBoxplot({
            datum,
            chartType,
            formatFunctions,
            index,
            legendName: rawDatum.name
          })
      );

      return items;
    });
  }

  /**
   * Create values that picked value from SeriesItems of SeriesGroups.
   * @returns {Array.<number>}
   * @private
   * * @override
   */
  _createValues() {
    let values = [];
    this.map(seriesGroup =>
      seriesGroup.items.forEach(group => {
        values.push(group.min);
        values.push(group.max);
        values.push(group.uq);
        values.push(group.lq);
        values.push(group.median);
      })
    );

    values = concat.apply([], values);

    return values.filter(value => !isNaN(value));
  }
}

export default SeriesDataModelForBoxplot;
