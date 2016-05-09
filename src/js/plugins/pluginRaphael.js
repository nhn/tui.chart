/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart');
var LineChart = require('./raphaelLineChart');
var AreaChart = require('./raphaelAreaChart');
var PieChart = require('./raphaelPieChart');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var MapChart = require('./raphaelMapChart');
var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart,
    bubble: CoordinateTypeChart,
    scatter: CoordinateTypeChart,
    map: MapChart,
    mapLegend: MapLegend,
    circleLegend: CircleLegend
};

tui.chart.registerPlugin(pluginName, pluginRaphael);
