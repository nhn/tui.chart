import { pluginRaphael, callback } from './plugins/pluginRaphael';
import chart from './chart';
import renderUtil from './helpers/renderUtil';
import arrayUtil from './helpers/arrayUtil';
import colorUtil from './helpers/colorutil';

import '../less/style.less';

chart.registerPlugin('Raphael', pluginRaphael, callback);

chart.renderUtil = renderUtil;
chart.arrayUtil = arrayUtil;
chart.colorutil = colorUtil;

/**
 * NHN. Toast UI Chart.
 * @namespace tui.chart
 */
module.exports = chart;
