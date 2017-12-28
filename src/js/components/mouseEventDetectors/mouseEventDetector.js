/**
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../../helpers/predicate');
var areaTypeEventDetectorFactory = require('./areaTypeEventDetector');
var simpleEventDetectorFactory = require('./simpleEventDetector');
var groupTypeEventDetectorFactory = require('./groupTypeEventDetector');
var boundsTypeEventDetectorFactory = require('./boundsTypeEventDetector');
var mapChartEventDetectorFactory = require('./mapChartEventDetector');

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
    // @todo chartType이나 chartTypes없이 모두 seriesTypes만 보도록 변경해야한다.컴포넌트 전체의 문제임
    params.chartTypes = seriesTypes;
    params.zoomable = zoomable;
    params.allowSelect = seriesAllowSelect;

    return factory(params);
}

mouseEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = mouseEventDetectorFactory;
