/**
 * @fileoverview NormalTooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var normalTooltipFactory = require('./normalTooltip');
var groupTooltipFactory = require('./groupTooltip');

/**
 * Label formatter function for pie chart
 * @param {object} seriesItem series item
 * @param {object} tooltipDatum tooltip datum object
 * @param {string} labelPrefix label prefix
 * @returns {object}
 */
function pieTooltipLabelFormatter(seriesItem, tooltipDatum, labelPrefix) {
    var ratioLabel;
    var percentageString = (seriesItem.ratio * 100).toFixed(4);
    var percent = parseFloat(percentageString);
    var needSlice = (percent < 0.0009 || percentageString.length > 5);

    percentageString = needSlice ? percentageString.substr(0, 4) : String(percent);
    ratioLabel = percentageString + '&nbsp;%&nbsp;' || '';

    tooltipDatum.ratioLabel = labelPrefix + ratioLabel;
    tooltipDatum.label = seriesItem.tooltipLabel || (seriesItem.label ? seriesItem.label : '');

    return tooltipDatum;
}

function tooltipFactory(params) {
    var chartType = params.chartOptions.chartType;
    var seriesTypes = params.seriesTypes;
    var xAxisOptions = params.chartOptions.xAxis;
    var factory = params.options.grouped ? groupTooltipFactory : normalTooltipFactory;

    if (chartType === 'pie') {
        params.labelFormatter = pieTooltipLabelFormatter;
    }

    params.chartType = chartType;
    params.chartTypes = seriesTypes;
    params.xAxisType = xAxisOptions.type;
    params.dateFormat = xAxisOptions.dateFormat;

    return factory(params);
}

tooltipFactory.componentType = 'tooltip';

module.exports = tooltipFactory;
