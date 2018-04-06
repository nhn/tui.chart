import {pluginRaphael, callback} from './plugins/pluginRaphael';
import chart from './chart';

require('../less/style.less');

chart.registerPlugin('Raphael', pluginRaphael, callback);
chart.renderUtil = require('./helpers/renderUtil');
chart.arrayUtil = require('./helpers/arrayUtil');
chart.colorutil = require('./helpers/colorutil');

/**
 * NHN Entertainment Toast UI Chart.
 * @namespace tui.chart
 */
module.exports = chart;
