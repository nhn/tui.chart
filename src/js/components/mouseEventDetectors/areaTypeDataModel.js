/**
 * @fileoverview AreaTypeDataModel is data model for mouse event detector of area type.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */
import predicate from '../../helpers/predicate';
import arrayUtil from '../../helpers/arrayUtil';
import snippet from 'tui-code-snippet';

export default class AreaTypeDataModel {
    /**
     * AreaTypeDataModel is data mode for mouse event detector of area type.
     * @constructs AreaTypeDataModel
     * @private
     * @param {Array} seriesItemBoundsData - series item bounds data
     */
    constructor(seriesItemBoundsData) {
        this.data = this._makeData(seriesItemBoundsData);

        /**
         * last group index
         * @type {number}
         */
        this.lastGroupIndex = 0;
    }

    /**
     * Make data for detecting mouse event.
     * @param {Array} seriesItemBoundsData - series item bounds data
     * @returns {Array}
     * @private
     */
    _makeData(seriesItemBoundsData) {
        const seriesItemBoundsLength = seriesItemBoundsData.length;
        let lastGroupIndex = 0;
        let data = seriesItemBoundsData.map((seriesDatum, seriesIndex) => {
            const {chartType, data: dotumData} = seriesDatum;
            let groupPositions = dotumData.groupPositions || dotumData.groupBounds;

            if (predicate.isLineTypeChart(chartType) || predicate.isRadialChart(chartType)) {
                groupPositions = arrayUtil.pivot(groupPositions);
            }

            lastGroupIndex = Math.max(groupPositions.length - 1, lastGroupIndex);

            return groupPositions.map((positions, groupIndex) => (
                positions.map((position, index) => {
                    let datum = null;

                    if (position) {
                        datum = {
                            chartType,
                            indexes: {
                                groupIndex,
                                index
                            },
                            bound: position
                        };
                    }

                    // Add legendIndex to datum on making multi series chart data, especially for LineScatterComboChart.
                    if (seriesItemBoundsLength > 1) {
                        datum.indexes.legendIndex = seriesIndex;
                    }

                    return datum;
                })
            ));
        });

        data = [].concat(...data);
        this.lastGroupIndex = lastGroupIndex;

        return [].concat(...data).filter(datum => !!datum);
    }

    /**
     * Find Data by layer position.
     * @param {{x: number, y: number}} layerPosition - layer position
     * @param {number} [distanceLimit] distance limitation to find data
     * @param {number} selectLegendIndex select legend sereis index
     * @returns {object}
     */
    findData(layerPosition, distanceLimit, selectLegendIndex) {
        const findFoundMap = {};
        let min = 100000;
        let findFound;

        distanceLimit = distanceLimit || Number.MAX_VALUE;

        this.data.forEach(datum => {
            const xDiff = layerPosition.x - datum.bound.left;
            const yDiff = layerPosition.y - datum.bound.top;
            const distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

            if (distance < distanceLimit && distance <= min) {
                min = distance;
                findFound = datum;
                findFoundMap[datum.indexes.index] = datum;
            }
        });

        if (!snippet.isNull(selectLegendIndex) && findFoundMap[selectLegendIndex]) {
            findFound = findFoundMap[selectLegendIndex];
        }

        return findFound;
    }

    /**
     * Find data by indexes.
     * @param {{index: {number}, seriesIndex: {number}}} indexes - indexe of series item displaying a tooltip
     * @returns {object}
     */
    findDataByIndexes({index, seriesIndex}) {
        let foundData = null;

        this.data.forEach(datum => {
            if (datum.indexes.groupIndex === index && datum.indexes.index === seriesIndex) {
                foundData = datum;
            }

            return !foundData;
        });

        return foundData;
    }

    /**
     * Get first data.
     * @param {number} index - index
     * @returns {object}
     */
    getFirstData(index) {
        const indexes = {
            index: 0,
            seriesIndex: index
        };

        return this.findDataByIndexes(indexes);
    }

    /**
     * Get last data.
     * @param {number} index - index
     * @returns {object}
     */
    getLastData(index) {
        const indexes = {
            index: this.lastGroupIndex,
            seriesIndex: index
        };

        return this.findDataByIndexes(indexes);
    }
}
