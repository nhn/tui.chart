/**
 * @fileoverview SeriesDataModel for Bullet Chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */
import SeriesItem from './seriesItem';
import SeriesDataModel from './seriesDataModel';
import chartConst from '../../const';
import snippet from 'tui-code-snippet';

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
        const {chartType} = this;
        const formatFunctions = this.formatFunctions;
        const maxRangeCount = 0;
        const maxMarkerCount = 0;
        const baseGroups = snippet.map(this.rawSeriesData, function(rawDatum) {
            var items = [];
            var data = rawDatum.data;
            var markers = rawDatum.markers;
            var markerCount = markers.length;
            var ranges = rawDatum.ranges;
            var rangeCount = ranges.length;

            if (ranges && rangeCount) {
                snippet.map(ranges, function(range) {
                    items.push(new SeriesItem({
                        datum: range,
                        chartType: chartType,
                        formatFunctions: formatFunctions,
                        type: chartConst.BULLET_TYPE_RANGE
                    }));
                });
                maxRangeCount = Math.max(maxRangeCount, rangeCount);
            }

            if (data) {
                items.push(new SeriesItem({
                    datum: data,
                    chartType: chartType,
                    formatFunctions: formatFunctions,
                    type: chartConst.BULLET_TYPE_ACTUAL
                }));
            }

            if (markers && markerCount) {
                snippet.map(markers, function(marker) {
                    items.push(new SeriesItem({
                        datum: marker,
                        chartType: chartType,
                        formabutFunctions: formatFunctions,
                        type: chartConst.BULLET_TYPE_MARKER
                    }));
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
