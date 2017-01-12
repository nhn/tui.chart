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
var RadialLineSeries = require('./raphaelRadialLineSeries');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var BoxTypeChart = require('./raphaelBoxTypeChart');
var MapChart = require('./raphaelMapChart');

var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');
var title = require('./raphaelTitleComponent');
var axis = require('./raphaelAxisComponent');

var RadialPlot = require('./raphaelRadialPlot');

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
    radial: RadialLineSeries,
    mapLegend: MapLegend,
    circleLegend: CircleLegend,
    radialPlot: RadialPlot,
    title: title,
    axis: axis
};

tui.chart.registerPlugin(pluginName, pluginRaphael);
