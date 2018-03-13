'use strict';

var pluginRaphael = require('./plugins/pluginRaphael');
var chart = require('./chart');
require('../less/style.less');

chart.registerPlugin(pluginRaphael.name, pluginRaphael.plugins, pluginRaphael.callback);
chart.renderUtil = require('./helpers/renderUtil');
chart.arrayUtil = require('./helpers/arrayUtil');
chart.colorutil = require('./helpers/colorutil');

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
module.exports = chart;
