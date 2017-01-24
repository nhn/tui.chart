/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var raphael = window.Raphael;

var BarChart = require('./raphaelBarChart');
var LineChart = require('./raphaelLineChart');
var AreaChart = require('./raphaelAreaChart');
var PieChart = require('./raphaelPieChart');
var RadialLineSeries = require('./raphaelRadialLineSeries');
var CoordinateTypeChart = require('./raphaelCoordinateTypeChart');
var BoxTypeChart = require('./raphaelBoxTypeChart');
var MapChart = require('./raphaelMapChart');

var legend = require('./raphaelLegendComponent');
var MapLegend = require('./raphaelMapLegend');
var CircleLegend = require('./raphaelCircleLegend');
var title = require('./raphaelTitleComponent');
var axis = require('./raphaelAxisComponent');

var RadialPlot = require('./raphaelRadialPlot');

var pluginName = 'Raphael';
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
    legend: legend,
    mapLegend: MapLegend,
    circleLegend: CircleLegend,
    radialPlot: RadialPlot,
    title: title,
    axis: axis
};
var callback = function(container, dimension) {
    var paper = raphael(container, dimension.width, dimension.height);
    var rect = paper.rect(0, 0, dimension.width, dimension.height);

    paper.pushDownBackgroundToBottom = function() {
        rect.toBack();
    };

    rect.attr({
        fill: '#fff',
        'stroke-width': 0
    });

    return paper;
};

tui.chart.registerPlugin(pluginName, pluginRaphael, callback);
