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
    csv: 'data:text/csv;charset=utf-8,%EF%BB%BF' /* BOM for utf-8 */
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
    var categories;
    var isHeatMap = (rawData.categories && snippet.isExisty(rawData.categories.x));
    var isBullet = (rawData.series && snippet.isExisty(rawData.series.bullet));
    var return2DArrayData = false;

    if (rawData) {
        if (isHeatMap) {
            return2DArrayData = _get2DArrayFromHeatmapRawData(rawData);
        } else if (isBullet) {
            return2DArrayData = _get2DArrayFromBulletRawData(rawData);
        } else if (rawData.categories) {
            categories = rawData.categories;
        }
        if (return2DArrayData) {
            return return2DArrayData;
        }

        resultArray.push([''].concat(categories));

        snippet.forEach(rawData.series, function(seriesDatum) {
            snippet.forEach(seriesDatum, function(seriesItem) {
                var row = [seriesItem.name].concat(seriesItem.data);

                resultArray.push(row);
            });
        });
    }

    return resultArray;
}

/**
 * Make table head data for Excel
 * @param {number} maxRangeCount - max range count
 * @param {number} maxMarkerCount - max marker count
 * @returns {Array.<string>} - table head data
 * @private
 */
function _makeTHeadForBullet(maxRangeCount, maxMarkerCount) {
    var tableHead = ['', chartConst.BULLET_TYPE_ACTUAL];
    var i = 0;

    for (; i < maxRangeCount; i += 1) {
        tableHead.push(chartConst.BULLET_TYPE_RANGE + i);
    }

    i = 0;
    for (; i < maxMarkerCount; i += 1) {
        tableHead.push(chartConst.BULLET_TYPE_MARKER + i);
    }

    return tableHead;
}

/**
 * Make table cells from bullet ranges
 * @param {Array.<Array.<number>>} ranges - series item's ranges data
 * @param {number} maxRangeCount - max range count
 * @returns {Array.<number>} - cells containing range data
 * @private
 */
function _makeTCellsFromBulletRanges(ranges, maxRangeCount) {
    var cells = [];
    var i = 0;
    var dataText;

    for (; i < maxRangeCount; i += 1) {
        dataText = '';

        if (ranges && ranges[i]) {
            dataText = ((ranges[i].length > 0) ? ranges[i][0] : '') +
             '~' + ((ranges[i].length > 1) ? ranges[i][1] : '');
        }
        cells.push(dataText);
    }

    return cells;
}

/**
 * Make table cells from bullet markers
 * @param {Array.<Array.<number>>} markers - series item's markers data
 * @param {number} maxMarkerCount - max marker count
 * @returns {Array.<number>} - cells containing marker data
 * @private
 */
function _makeTCellsFromBulletMarkers(markers, maxMarkerCount) {
    var cells = [];
    var i = 0;
    var dataText;

    for (; i < maxMarkerCount; i += 1) {
        dataText = markers && markers[i] ? markers[i] : '';
        cells.push(dataText);
    }

    return cells;
}

/**
 * Make table data for importing in excel, by using bullet chart raw data
 * @param {object} rawData - raw data
 * @param {object} [options] download option
 * @returns {Array.<Array.<string>>} - table data for importing in excel
 * @private
 */
function _get2DArrayFromBulletRawData(rawData) {
    var resultArray = [];
    var maxCounts = _calculateMaxCounts(rawData.series.bullet);
    var maxRangeCount = maxCounts.maxRangeCount;
    var maxMarkerCount = maxCounts.maxMarkerCount;

    resultArray.push(_makeTHeadForBullet(maxRangeCount, maxMarkerCount));

    snippet.forEach(rawData.series.bullet, function(seriesItem) {
        var row = [seriesItem.name, seriesItem.data];

        row = row.concat(_makeTCellsFromBulletRanges(seriesItem.ranges, maxRangeCount));
        row = row.concat(_makeTCellsFromBulletMarkers(seriesItem.markers, maxMarkerCount));
        resultArray.push(row);
    });

    return resultArray;
}

/**
 * Calculate maxinum count of range and marker property
 * @param {object} bulletSeries - raw series data of bullet chart
 * @returns {object} - maximum count of range and marker property
 * @private
 */
function _calculateMaxCounts(bulletSeries) {
    var maxRangeCount = 0;
    var maxMarkerCount = 0;

    snippet.forEach(bulletSeries, function(series) {
        maxRangeCount = Math.max(maxRangeCount, series.ranges.length);
        maxMarkerCount = Math.max(maxMarkerCount, series.markers.length);
    });

    return {
        maxRangeCount: maxRangeCount,
        maxMarkerCount: maxMarkerCount
    };
}

/**
 * Make table data for importing in excel, by using heatmap chart raw data
 * @param {object} rawData - raw data
 * @returns {Array.<Array.<string>>} - table data for importing in excel
 * @private
 */
function _get2DArrayFromHeatmapRawData(rawData) {
    var resultArray = [];

    resultArray.push([''].concat(rawData.categories.x));

    snippet.forEach(rawData.series, function(seriesDatum) {
        snippet.forEach(seriesDatum, function(seriesItem, index) {
            var row = [rawData.categories.y[index]].concat(seriesItem);

            resultArray.push(row);
        });
    });

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
dataExporter._get2DArrayFromBulletRawData = _get2DArrayFromBulletRawData;
dataExporter._get2DArrayFromHeatmapRawData = _get2DArrayFromHeatmapRawData;
dataExporter._makeTCellsFromBulletRanges = _makeTCellsFromBulletRanges;
dataExporter._makeTCellsFromBulletMarkers = _makeTCellsFromBulletMarkers;
dataExporter._makeTHeadForBullet = _makeTHeadForBullet;

module.exports = dataExporter;
