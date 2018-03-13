/**
 * @fileoverview NormalTooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var normalTooltipFactory = require('./normalTooltip');
var groupTooltipFactory = require('./groupTooltip');
var mapChartTooltipFactory = require('./mapChartTooltip');
var predicate = require('../../helpers/predicate');
var snippet = require('tui-code-snippet');

/**
 * Label formatter function for pie chart
 * @param {object} seriesItem series item
 * @param {object} tooltipDatum tooltip datum object
 * @param {string} labelPrefix label prefix
 * @returns {object}
 * @ignore
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

/**
 * Factory for Tooltip
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
function tooltipFactory(params) {
    var chartType = params.chartOptions.chartType;
    var seriesTypes = params.seriesTypes;
    var xAxisOptions = params.chartOptions.xAxis;
    var colors = [];
    var factory;

    snippet.forEach(snippet.filter(params.chartTheme.legend, function(item) {
        return snippet.isArray(item.colors);
    }), function(series) {
        colors = colors.concat(series.colors);
    });

    if (chartType === 'map') {
        factory = mapChartTooltipFactory;
    } else if (params.options.grouped) {
        factory = groupTooltipFactory;
    } else {
        factory = normalTooltipFactory;
    }

    if (chartType === 'pie' || predicate.isPieDonutComboChart(chartType, seriesTypes)) {
        params.labelFormatter = pieTooltipLabelFormatter;
    }

    params.chartType = chartType;
    params.chartTypes = seriesTypes;
    params.xAxisType = xAxisOptions.type;
    params.dateFormat = xAxisOptions.dateFormat;
    params.colors = colors;

    return factory(params);
}

tooltipFactory.componentType = 'tooltip';

module.exports = tooltipFactory;
