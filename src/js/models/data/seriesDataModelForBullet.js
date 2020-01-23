/**
 * @fileoverview SeriesDataModel for Bullet Chart
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import SeriesItem from './seriesItem';
import SeriesDataModel from './seriesDataModel';
import chartConst from '../../const';

class SeriesDataModelForBullet extends SeriesDataModel {
  /**
   * SeriesDataModelForBullet is series model for boxplot chart
   * SeriesDataModel.groups has SeriesGroups.
   * @constructs SeriesDataModel
   * @param {rawSeriesData} rawSeriesData - raw series data
   * @param {string} chartType - chart type
   * @param {object} options - options
   * @param {Array.<function>} formatFunctions - format functions
   */

  /**
   * Create base groups.
   * Base groups is two-dimensional array by seriesItems.
   * @returns {Array.<Array.<(SeriesItem | SeriesItemForCoordinateType)>>}
   * @private
   * @override
   */
  _createBaseGroups() {
    const { chartType, formatFunctions } = this;
    let maxRangeCount = 0;
    let maxMarkerCount = 0;
    const baseGroups = this.rawSeriesData.map(rawDatum => {
      const items = [];
      const { data, markers, ranges } = rawDatum;
      const markerCount = markers.length;
      const rangeCount = ranges.length;

      if (ranges && rangeCount) {
        ranges.forEach(range => {
          items.push(
            new SeriesItem({
              datum: range,
              chartType,
              formatFunctions,
              type: chartConst.BULLET_TYPE_RANGE
            })
          );
        });
        maxRangeCount = Math.max(maxRangeCount, rangeCount);
      }

      if (data) {
        items.push(
          new SeriesItem({
            datum: data,
            chartType,
            formatFunctions,
            type: chartConst.BULLET_TYPE_ACTUAL
          })
        );
      }

      if (markers && markerCount) {
        markers.forEach(marker => {
          items.push(
            new SeriesItem({
              datum: marker,
              chartType,
              formabutFunctions: formatFunctions,
              type: chartConst.BULLET_TYPE_MARKER
            })
          );
        });
        maxMarkerCount = Math.max(maxMarkerCount, markerCount);
      }

      return items;
    });

    this.maxMarkerCount = maxMarkerCount;
    this.maxRangeCount = maxRangeCount;

    return baseGroups;
  }

  /**
   * Create SeriesGroups from rawData.series.
   * @returns {Array.<SeriesGroup>}
   * @private
   */
  _createSeriesGroupsFromRawData() {
    return SeriesDataModel.prototype._createSeriesGroupsFromRawData.call(this);
  }
}

export default SeriesDataModelForBullet;
