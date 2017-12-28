/**
 * @fileOverview Chart data exporter
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var downloader = require('./downloader');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');

var DATA_URI_HEADERS = {
    xls: 'data:application/vnd.ms-excel;base64,',
    csv: 'data:text/csv,'
};
var DATA_URI_BODY_MAKERS = {
    xls: _makeXlsBodyWithRawData,
    csv: _makeCsvBodyWithRawData
};
var dataExtensions = [].concat([], chartConst.DATA_EXTENSIONS);

var dataExporter = {
    /**
     * Download chart data
     * @param {string} fileName file name
     * @param {string} extension file extension
     * @param {object} rawData raw data of chart
     * @param {object} [downloadOption] download option
     */
    downloadData: function(fileName, extension, rawData, downloadOption) {
        var chartData2DArray = _get2DArrayFromRawData(rawData);
        var content = DATA_URI_HEADERS[extension] + DATA_URI_BODY_MAKERS[extension](chartData2DArray, downloadOption);

        downloader.execDownload(fileName, extension, content);
    },

    /**
     * Returns data extensions
     * @returns {Array.<string>}
     */
    getExtensions: function() {
        return dataExtensions;
    }
};

/**
 * Get pivoted second dimension array from table to use element.innerText
 * @param {rawData} rawData - chart's raw data
 * @returns {Array.<Array>}
 * @private
 */
function _get2DArrayFromRawData(rawData) {
    var resultArray = [];
    var categories, seriesName, data;
    var isHeatMap = (rawData.categories && snippet.isExisty(rawData.categories.x));

    if (rawData) {
        if (isHeatMap) {
            categories = rawData.categories.x;
        } else if (rawData.categories) {
            categories = rawData.categories;
        }

        resultArray.push([''].concat(categories));

        snippet.forEach(rawData.series, function(seriesDatum) {
            snippet.forEach(seriesDatum, function(seriesItem, index) {
                if (isHeatMap) {
                    seriesName = rawData.categories.y[index];
                    data = seriesItem;
                } else {
                    seriesName = seriesItem.name;
                    data = seriesItem.data;
                }

                resultArray.push([seriesName].concat(data));
            });
        });
    }

    return resultArray;
}

/**
 * Get table element from chart data 2D array for xls content
 * @param {Array.<Array<*>>} chartData2DArray - chart data 2D array
 * @returns {string}
 * @private
 */
function _getTableElementStringForXls(chartData2DArray) {
    var tableElementString = '<table>';
    snippet.forEach(chartData2DArray, function(row, rowIndex) {
        var cellTagName = rowIndex === 0 ? 'th' : 'td';

        tableElementString += '<tr>';

        snippet.forEach(row, function(cell, cellIndex) {
            var cellNumberClass = (rowIndex !== 0 || cellIndex === 0) ? ' class="number"' : '';
            var cellString = '<' + cellTagName + cellNumberClass + '>' + cell + '</' + cellTagName + '>';

            tableElementString += cellString;
        });

        tableElementString += '</tr>';
    });

    tableElementString += '</table>';

    return tableElementString;
}

/**
 * Make xls file with chart series data
 * @param {Array.<Array.<object>>} chartData2DArray - chart chartData2DArray
 * @returns {string} base64 xls file content
 * @private
 */
function _makeXlsBodyWithRawData(chartData2DArray) {
    var xlsString = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
        'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
        'xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head>' +
            '<!--[if gte mso 9]>' +
                '<xml>' +
                    '<x:ExcelWorkbook>' +
                        '<x:ExcelWorksheets>' +
                            '<x:ExcelWorksheet>' +
                                '<x:Name>Ark1</x:Name>' +
                                '<x:WorksheetOptions>' +
                                    '<x:DisplayGridlines/>' +
                                '</x:WorksheetOptions>' +
                            '</x:ExcelWorksheet>' +
                        '</x:ExcelWorksheets>' +
                        '</x:ExcelWorkbook>' +
                '</xml>' +
            '<![endif]-->' +
            '<meta name=ProgId content=Excel.Sheet>' +
            '<meta charset=UTF-8>' +
        '</head>' +
        '<body>' +
            _getTableElementStringForXls(chartData2DArray) +
        '</body>' +
        '</html>';

    return window.btoa(unescape(encodeURIComponent(xlsString)));
}

/**
 * Make csv text with chart series data
 * @param {Array.<Array.<object>>} chartData2DArray - chart chartData2DArray
 * @param {object} [option] - download option
 * @param {object} [option.itemDelimiter = ','] - item delimiter
 * @param {object} [option.lineDelimiter = '\n'] - line delimiter
 * @returns {string} URI encoded csv text
 * @private
 */
function _makeCsvBodyWithRawData(chartData2DArray, option) {
    var csvText = '';
    var lineDelimiter = (option && option.lineDelimiter) || '\u000a';
    var itemDelimiter = (option && option.itemDelimiter) || ',';
    var lastRowIndex = chartData2DArray.length - 1;

    snippet.forEachArray(chartData2DArray, function(row, rowIndex) {
        var lastCellIndex = row.length - 1;

        snippet.forEachArray(row, function(cell, cellIndex) {
            var cellContent = (snippet.isNumber(cell) ? cell : '"' + cell + '"');

            csvText += cellContent;

            if (cellIndex < lastCellIndex) {
                csvText += itemDelimiter;
            }
        });

        if (rowIndex < lastRowIndex) {
            csvText += lineDelimiter;
        }
    });

    return encodeURIComponent(csvText);
}

// export private methods for Test
dataExporter._makeCsvBodyWithRawData = _makeCsvBodyWithRawData;
dataExporter._makeXlsBodyWithRawData = _makeXlsBodyWithRawData;
dataExporter._get2DArrayFromRawData = _get2DArrayFromRawData;

module.exports = dataExporter;
