/**
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import predicate from '../../helpers/predicate';
import areaTypeEventDetectorFactory from './areaTypeEventDetector';
import simpleEventDetectorFactory from './simpleEventDetector';
import groupTypeEventDetectorFactory from './groupTypeEventDetector';
import boundsTypeEventDetectorFactory from './boundsTypeEventDetector';
import mapChartEventDetectorFactory from './mapChartEventDetector';

/**
 * Factory for MouseEventDetector
 * @param {object} params parameter
 * @returns {object}
 * @ignore
 */
function mouseEventDetectorFactory(params) {
    var chartType = params.chartOptions.chartType;
    var seriesTypes = params.seriesTypes;
    var zoomable = params.chartOptions.series.zoomable;
    var seriesAllowSelect = params.chartOptions.series.allowSelect;
    var factory;

    if (params.chartOptions.tooltip.grouped) {
        factory = groupTypeEventDetectorFactory;
    } else if (predicate.isMapChart(chartType)) {
        factory = mapChartEventDetectorFactory;
    } else if (predicate.isBarTypeChart(chartType)
        || predicate.isBoxplotChart(chartType)
        || predicate.isHeatmapChart(chartType)
        || predicate.isTreemapChart(chartType)
        || predicate.isBulletChart(chartType)
    ) {
        factory = boundsTypeEventDetectorFactory;
    } else if (predicate.isCoordinateTypeChart(chartType)
        || predicate.isPieChart(chartType)
        || predicate.isPieDonutComboChart(chartType, seriesTypes)
    ) {
        factory = simpleEventDetectorFactory;
    } else {
        factory = areaTypeEventDetectorFactory;
    }

    params.chartType = chartType;
    // @todo replace chartType, chartTypes to seriesTypes, problem of the whole component
    params.chartTypes = seriesTypes;
    params.zoomable = zoomable;
    params.allowSelect = seriesAllowSelect;

    return factory(params);
}

mouseEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = mouseEventDetectorFactory;
