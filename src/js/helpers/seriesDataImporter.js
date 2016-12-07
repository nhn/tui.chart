/**
 * @fileOverview Series data importer
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('./arrayUtil');

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
    var chartData;

    if (table2DArray.length > 0) {
        chartData = {};
        chartData.categories = [];
        chartData.series = [];

        chartData.categories = table2DArray.shift().slice(1);
        tui.util.forEach(table2DArray, function(tr) {
            var seriesDatum = {};

            seriesDatum.name = tr[0];
            seriesDatum.data = tr.slice(1);

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
    var trs = [];
    var secondDimensionArray = [];
    var resultArray = [];

    if (tableElement) {
        trs = tui.util.toArray(tableElement.getElementsByTagName('TR'));

        tui.util.forEach(trs, function(tr, index) {
            var tagName = index === 0 ? 'TH' : 'TD';
            var cells = tui.util.toArray(tr.getElementsByTagName(tagName));
            var rows = tui.util.pluck(cells, 'innerText');

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
 * @api
 */
function makeDataWithTable(table) {
    var element, chartData;

    if (table.element && table.element.tagName === 'TABLE') {
        element = table.element;
    } else if (table.elementId) {
        element = document.getElementById(table.elementId);
    }

    chartData = getChartDataFrom2DArray(get2DArray(element));

    return chartData;
}

module.exports = {
    makeDataWithTable: makeDataWithTable
};
