/**
 * @fileoverview Raphael render plugin.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChart = require('./raphaelBarChart'),
    LineChart = require('./raphaelLineChart'),
    AreaChart = require('./raphaelAreaChart'),
    PieChart = require('./raphaelPieChart'),
    BubbleChart = require('./raphaelBubbleChart'),
    MapChart = require('./raphaelMapChart'),
    MapLegend = require('./raphaelMapLegend');

var pluginName = 'raphael',
    pluginRaphael;

pluginRaphael = {
    bar: BarChart,
    column: BarChart,
    line: LineChart,
    area: AreaChart,
    pie: PieChart,
    bubble: BubbleChart,
    map: MapChart,
    mapLegend: MapLegend
};

tui.chart.registerPlugin(pluginName, pluginRaphael);
