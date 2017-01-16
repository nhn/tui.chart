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

function mouseEventDetectorFactory(params) {
    var chartType = params.chartOptions.chartType;
    var chartTypes = params.chartOptions.chartTypes;
    var zoomable = params.chartOptions.series.zoomable;
    var seriesAllowSelect = params.chartOptions.series.allowSelect;
    var factory;

    if (predicate.isBarTypeChart(chartType)) {
        factory = boundsTypeEventDetectorFactory;
    } else if (predicate.isCoordinateTypeChart(chartType)) {
        factory = simpleEventDetectorFactory;
    } else if (params.chartOptions.tooltip.grouped) {
        factory = groupTypeEventDetectorFactory;
    } else {
        factory = areaTypeEventDetectorFactory;
    }

    params.chartType = chartType;
    params.chartTypes = chartTypes;
    params.zoomable = zoomable;
    params.allowSelect = seriesAllowSelect;

    return factory(params);
}

mouseEventDetectorFactory.componentType = 'mouseEventDetector';

module.exports = mouseEventDetectorFactory;
