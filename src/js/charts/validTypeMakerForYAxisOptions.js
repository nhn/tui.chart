/**
 * @fileoverview Implements valid type maker on yAxisOptions
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';

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
export default function validTypeMakerForYAxisOptions(params) {
  const { rawSeriesData, yAxisOptions } = params;
  const chartTypesMap = makeChartTypesMap(rawSeriesData, yAxisOptions);

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
  const seriesTypes = snippet.keys(rawSeriesData).sort();
  const optionChartTypes = getYAxisOptionChartTypes(seriesTypes, yAxisOption);
  const chartTypes = optionChartTypes.length ? optionChartTypes : seriesTypes;
  const validChartTypes = optionChartTypes.filter(_chartType => rawSeriesData[_chartType].length);
  let chartTypesMap;

  if (validChartTypes.length === 1) {
    chartTypesMap = {
      chartTypes: validChartTypes,
      seriesTypes: validChartTypes
    };
  } else {
    chartTypesMap = {
      chartTypes,
      seriesTypes
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
  let resultChartTypes = chartTypes.slice();
  const yAxisOptions = [].concat(yAxisOption || []);
  let isReverse = false;
  let optionChartTypes;

  if (!yAxisOptions.length || (yAxisOptions.length === 1 && !yAxisOptions[0].chartType)) {
    resultChartTypes = [];
  } else if (yAxisOptions.length) {
    optionChartTypes = yAxisOptions.map(option => option.chartType);

    optionChartTypes.forEach((chartType, index) => {
      isReverse = isReverse || (chartType && resultChartTypes[index] !== chartType) || false;
    });

    if (isReverse) {
      resultChartTypes.reverse();
    }
  }

  return resultChartTypes;
}
