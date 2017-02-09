/**
 * @fileOverview Chart data exporter
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var downloader = require('./downloader');

var DATA_URI_HEADERS = {
    xls: 'data:application/vnd.ms-excel;base64,',
    csv: 'data:text/csv,'
};
var EXPORT_DATA_MAKERS = {
    xls: _makeXlsStringWithRawData,
    csv: _makeCsvTextWithRawData
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
    var isHeatMap = (rawData.categories && tui.util.isExisty(rawData.categories.x));

    if (rawData) {
        if (isHeatMap) {
            categories = rawData.categories.x;
        } else if (rawData.categories) {
            categories = rawData.categories;
        }

        resultArray.push([''].concat(categories));

        tui.util.forEach(rawData.series, function(seriesDatum) {
            tui.util.forEach(seriesDatum, function(seriesItem, index) {
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
    tui.util.forEach(chartData2DArray, function(row, rowIndex) {
        var cellTagName = rowIndex === 0 ? 'th' : 'td';

        tableElementString += '<tr>';

        tui.util.forEach(row, function(cell, cellIndex) {
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
 * @param {rawData} rawData - chart rawData
 * @returns {string} xls file content
 * @private
 */
function _makeXlsStringWithRawData(rawData) {
    var chartData2DArray = _get2DArrayFromRawData(rawData);
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
 * @param {rawData} rawData - chart rawData
 * @param {object} option - download option
 * @returns {string} csv text
 * @private
 */
function _makeCsvTextWithRawData(rawData, option) {
    var chartData2DArray = _get2DArrayFromRawData(rawData);
    var csvText = '';
    var lineDelimiter = option.lineDelimiter || '\u000a';
    var itemDelimiter = option.itemDelimiter || ',';
    var lastRowIndex = chartData2DArray.length - 1;

    tui.util.forEachArray(chartData2DArray, function(row, rowIndex) {
        var lastCellIndex = row.length - 1;

        tui.util.forEachArray(row, function(cell, cellIndex) {
            var cellContent = typeof cell === 'number' ? cell : '"' + cell + '"';

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

/**
 * Download chart data
 * @param {string} fileName file name
 * @param {string} extension file extension
 * @param {object} rawData raw data of chart
 * @param {object} [downloadOption] download option
 */
function downloadData(fileName, extension, rawData, downloadOption) {
    var content = DATA_URI_HEADERS[extension] + EXPORT_DATA_MAKERS[extension](rawData, downloadOption);

    downloader.execDownload(fileName, extension, content);
}

module.exports = {
    downloadData: downloadData
};
