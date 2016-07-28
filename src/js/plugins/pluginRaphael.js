/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart');
var LineChart = require('./raphaelLineChart');
var AreaChart = require('./raphaelAreaChart');
var PieChart = require('./raphaelPieChart');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var BoxTypeChart = require('./raphaelBoxTypeChart');
var MapChart = require('./raphaelMapChart');
var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');

var pluginName = 'raphael';
var pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart,
    bubble: CoordinateTypeChart,
    scatter: CoordinateTypeChart,
    heatmap: BoxTypeChart,
    treemap: BoxTypeChart,
    map: MapChart,
    mapLegend: MapLegend,
    circleLegend: CircleLegend
};

tui.chart.registerPlugin(pluginName, pluginRaphael);
