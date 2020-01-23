/**
 * @fileOverview Series data importer
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import arrayUtil from './arrayUtil';
import snippet from 'tui-code-snippet';

/**
 * Get series data from 2D array
 * @param {Array.<Array>} table2DArray - extracted 2DArray from table element
 * @returns {{
 *     series: Array.<object>,
 *     categories: Array.<string>
 *         }}
 * @private
 */
function getChartDataFrom2DArray(table2DArray) {
  let chartData;

  if (table2DArray.length > 0) {
    chartData = {};
    chartData.categories = [];
    chartData.series = [];
    chartData.categories = table2DArray.shift().slice(1);

    table2DArray.forEach(tr => {
      const seriesDatum = {
        name: tr[0],
        data: tr.slice(1)
      };
      chartData.series.push(seriesDatum);
    });
  }

  return chartData;
}

/**
 * Get pivoted second dimension array from table to use element.innerText
 * @param {HTMLElement} tableElement - table element for extract chart's raw data
 * @returns {Array.<Array>}
 * @private
 */
function get2DArray(tableElement) {
  let resultArray = [];

  if (tableElement) {
    const secondDimensionArray = [];
    const trs = snippet.toArray(tableElement.getElementsByTagName('TR'));

    snippet.forEach(trs, (tr, index) => {
      const tagName = index === 0 ? 'TH' : 'TD';
      const cells = snippet.toArray(tr.getElementsByTagName(tagName));
      const rows = snippet.pluck(cells, 'innerText');

      secondDimensionArray.push(rows);
    });

    if (secondDimensionArray[0].length < secondDimensionArray[1].length) {
      secondDimensionArray[0].unshift('');
    }

    resultArray = arrayUtil.pivot(secondDimensionArray);
  }

  return resultArray;
}

/**
 * Make chart data with table element
 * @param {({
 *     elementId:string
 * }|{
 *     element:HTMLElement
 * })} table - object for table data import
 * @returns {rawData}
 * @ignore
 * @api
 */
function makeDataWithTable(table) {
  let element;

  if (table.element && table.element.tagName === 'TABLE') {
    ({ element } = table);
  } else if (table.elementId) {
    element = document.getElementById(table.elementId);
  }

  const chartData = getChartDataFrom2DArray(get2DArray(element));

  return chartData;
}

export default {
  makeDataWithTable
};
