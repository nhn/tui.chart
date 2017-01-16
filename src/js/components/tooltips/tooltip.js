/**
 * @fileoverview NormalTooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var normalTooltipFactory = require('./normalTooltip');
var groupTooltipFactory = require('./groupTooltip');

function tooltipFactory(params) {
    var chartType = params.chartOptions.chartType;
    var chartTypes = params.chartOptions.chartTypes;
    var xAxisOptions = params.chartOptions.xAxis;
    var factory = params.options.grouped ? groupTooltipFactory : normalTooltipFactory;

    params.chartType = chartType;
    params.chartTypes = chartTypes;
    params.xAxisType = xAxisOptions.type;
    params.dateFormat = xAxisOptions.dateFormat;

    return factory(params);
}

tooltipFactory.componentType = 'tooltip';

module.exports = tooltipFactory;
