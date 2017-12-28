/**
 * @fileoverview Implements valid type maker on yAxisOptions
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

/**
 * Make valid types on yAxisOptions
 * @param {object} params parameters
 * @param {Array.<Array>} params.rawSeriesData raw series data
 * @param {object} params.yAxisOptions chart yAxis options
 * @param {string} params.chartType chart type
 * @returns {object} {
 *     chartTypes: Array.<string>,
 *     seriesTypes: Array.<string>,
 *     hasRightYAxis: boolean,
 *     yAxisOptionsMap: object
 * }
 * @ignore
 */
function validTypeMakerForYAxisOptions(params) {
    var rawSeriesData = params.rawSeriesData;
    var yAxisOptions = params.yAxisOptions;
    var chartTypesMap = makeChartTypesMap(rawSeriesData, yAxisOptions);

    return {
        chartTypes: chartTypesMap.chartTypes,
        seriesTypes: chartTypesMap.seriesTypes
    };
}

/**
 * Make chart types map.
 * @param {object} rawSeriesData raw series data
 * @param {object} yAxisOption option for y axis
 * @returns {object} chart types map
 * @private
 */
function makeChartTypesMap(rawSeriesData, yAxisOption) {
    var seriesTypes = snippet.keys(rawSeriesData).sort();
    var optionChartTypes = getYAxisOptionChartTypes(seriesTypes, yAxisOption);
    var chartTypes = optionChartTypes.length ? optionChartTypes : seriesTypes;
    var validChartTypes = snippet.filter(optionChartTypes, function(_chartType) {
        return rawSeriesData[_chartType].length;
    });
    var chartTypesMap;

    if (validChartTypes.length === 1) {
        chartTypesMap = {
            chartTypes: validChartTypes,
            seriesTypes: validChartTypes
        };
    } else {
        chartTypesMap = {
            chartTypes: chartTypes,
            seriesTypes: seriesTypes
        };
    }

    return chartTypesMap;
}

/**
 * Get y axis option chart types.
 * @param {Array.<string>} chartTypes chart types
 * @param {object} yAxisOption - options for y axis
 * @returns {Array.<string>}
 * @private
 */
function getYAxisOptionChartTypes(chartTypes, yAxisOption) {
    var resultChartTypes = chartTypes.slice();
    var yAxisOptions = [].concat(yAxisOption || []);
    var isReverse = false;
    var optionChartTypes;

    if (!yAxisOptions.length || (yAxisOptions.length === 1 && !yAxisOptions[0].chartType)) {
        resultChartTypes = [];
    } else if (yAxisOptions.length) {
        optionChartTypes = snippet.map(yAxisOptions, function(option) {
            return option.chartType;
        });

        snippet.forEachArray(optionChartTypes, function(chartType, index) {
            isReverse = isReverse || ((chartType && resultChartTypes[index] !== chartType) || false);
        });

        if (isReverse) {
            resultChartTypes.reverse();
        }
    }

    return resultChartTypes;
}

module.exports = validTypeMakerForYAxisOptions;
