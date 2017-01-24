/**
 * @fileOverview Chart data exporter
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var isIE10OrIE11 = tui.util.browser.msie && (tui.util.browser.version === 10 || tui.util.browser.version === 11);

var isImageDownloadAvailable = isBrowserSupportClientSideDownload()
    && (!isIE10OrIE11 || (isIE10OrIE11 && document.createElement('canvas').getContext('2d').drawSvg));


var DATA_URI_HEADERS = {
    xls: 'data:application/vnd.ms-excel;base64,',
    csv: 'data:text/csv,'
};
var EXPORT_DATA_MAKERS = {
    xls: _makeXlsStringWithRawData,
    csv: _makeCsvTextWithRawData
};
var DOWNLOADER_FUNCTIONS = {
    downloadAttribute: _downloadWithAnchorElementDownloadAttribute,
    msSaveOrOpenBlob: _downloadWithMsSaveOrOpenBlob
};

/**
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 */
function isImageExtension(extension) {
    return extension === 'png' || extension === 'jpeg';
}

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
 * Return download method name of current browser supports
 * @returns {string}
 * @private
 */
function _getDownloadMethod() {
    var isDownloadAttributeSupported = tui.util.isExisty(document.createElement('a').download);
    var isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;
    var method = 'none';

    if (isMsSaveOrOpenBlobSupported) {
        method = 'msSaveOrOpenBlob';
    } else if (isDownloadAttributeSupported) {
        method = 'downloadAttribute';
    }

    return method;
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


    return xlsString;
}

/**
 * Make csv text with chart series data
 * @param {rawData} rawData - chart rawData
 * @param {string} itemDelimiterCharacter - item delimiter
 * @param {string} lineDelimiterCharacter - chart rawData
 * @returns {string} csv text
 * @private
 */
function _makeCsvTextWithRawData(rawData, itemDelimiterCharacter, lineDelimiterCharacter) {
    var chartData2DArray = _get2DArrayFromRawData(rawData);
    var csvText = '';
    var lineDelimiter = lineDelimiterCharacter ? lineDelimiterCharacter : '\u000a';
    var itemDelimiter = itemDelimiterCharacter ? itemDelimiterCharacter : ',';
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

    return csvText;
}


/**
 * Download image with png format
 * @param {string} fileName - file name to save
 * @param {string} extension - extension type
 * @private
 */
function _downloadImage(fileName, extension) {
    var container = document.getElementsByClassName('tui-chart')[0];
    var svg = container.getElementsByTagName('svg')[0];
    var svgParent = svg.parentNode;
    var DOMURL = window.URL || window.webkitURL || window;
    var img = new Image();
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var url, blob, svgString;
    var tempWrapper = document.createElement('DIV');

    tempWrapper.appendChild(svg);

    svgString = tempWrapper.innerHTML;
    svgParent.appendChild(svg);
    tempWrapper = null;

    canvas.width = width;
    canvas.height = height;

    // remove name space for IE
    if (isIE10OrIE11) {
        svgString = svgString.replace(/xmlns:NS1=""/, '');
        svgString = svgString.replace(/NS1:xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/, '');
        svgString = svgString.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '');
        svgString = svgString.replace(/xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/, '');
    }

    if (isIE10OrIE11 && ctx.drawSvg) {
        ctx.drawSvg(svgString, 0, 0);

        _download(canvas.toDataURL('image/' + extension, 1), fileName, extension);
    } else {
        blob = new Blob([svgString], {type: 'image/svg+xml'});
        url = DOMURL.createObjectURL(blob);

        img.onload = function() {
            ctx.drawImage(img, 0, 0, width, height);

            _download(canvas.toDataURL('image/' + extension, 1), fileName, extension);

            DOMURL.revokeObjectURL(url);
        };
        img.src = url;
    }
}

/**
 * Base64 string to blob
 * @param {string} base64String - base64 string
 * @returns {Blob}
 * @private
 */
function base64toBlob(base64String) {
    var contentType = base64String.substr(0, base64String.indexOf(';base64,')).substr(base64String.indexOf(':') + 1);
    var sliceSize = 1024;
    var byteCharacters = atob(base64String.substr(base64String.indexOf(',') + 1));
    var byteArrays = [];
    var offset, slice, byteNumbers, i, byteArray, resultBlob;

    for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        slice = byteCharacters.slice(offset, offset + sliceSize);

        byteNumbers = new Array(slice.length);

        for (i = 0; i < slice.length; i += 1) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArray = new window.Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    resultBlob = new Blob(byteArrays, {type: contentType});

    return resultBlob;
}

/**
 * Download content to file with msSaveOrOpenBlob
 * @param {string} content - file content
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @private
 */
function _downloadWithMsSaveOrOpenBlob(content, fileName, extension) {
    var blobObject = isImageExtension(extension) ? base64toBlob(content) : new Blob([content]);
    window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.' + extension);
}

/**
 * Download content to file with anchor element's download attribute
 * @param {string} content - file content
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @private
 */
function _downloadWithAnchorElementDownloadAttribute(content, fileName, extension) {
    var anchorElement = document.createElement('a');
    var data = extension !== 'csv' ? window.btoa(unescape(encodeURIComponent(content))) : encodeURIComponent(content);
    var dataUri;

    if (!content) {
        return;
    }

    if (isImageExtension(extension)) {
        dataUri = content;
    } else {
        dataUri = DATA_URI_HEADERS[extension] + data;
    }

    anchorElement.href = dataUri;
    anchorElement.target = '_blank';
    anchorElement.download = fileName + '.' + extension;

    document.body.appendChild(anchorElement);

    anchorElement.click();
    anchorElement.remove();
}

/**
 * Download content to file with given filename and extension
 * @param {string} content - file content
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @private
 */
function _download(content, fileName, extension) {
    var downloadMethod = _getDownloadMethod();

    if (downloadMethod && tui.util.isString(content)) {
        DOWNLOADER_FUNCTIONS[downloadMethod](content, fileName, extension);
    }
}

/**
 * Download chart data with given export type
 * @param {string} extension - file extension
 * @param {object} rawData - chart raw data
 * @param {string} chartTitle - chart title
 */
function exportChartData(extension, rawData, chartTitle) {
    var fileName = chartTitle;

    // Image downloads asynchronous because of waiting until image loaded from svg data URI.
    if (isImageExtension(extension)) {
        _downloadImage(fileName, extension);
    } else {
        _download(EXPORT_DATA_MAKERS[extension](rawData), fileName, extension);
    }
}

/**
 * Return boolean value for browser support client side download
 * @returns {boolean}
 */
function isBrowserSupportClientSideDownload() {
    var method = _getDownloadMethod();

    return method !== 'none';
}

/**
 * Return boolean value for chart data is able to export
 * @param {object} seriesDataModels series data model
 * @returns {boolean}
 */
function isDataDownloadAvailable(seriesDataModels) {
    var result = true;

    tui.util.forEach(seriesDataModels, function(seriesDataModel) {
        if (seriesDataModel.isCoordinateType) {
            result = false;
        }

        return false;
    });

    return result;
}

module.exports = {
    exportChartData: exportChartData,
    isBrowserSupportClientSideDownload: isBrowserSupportClientSideDownload,
    isDataDownloadAvailable: isDataDownloadAvailable,
    isImageDownloadAvailable: isImageDownloadAvailable,
    isImageExtension: isImageExtension
};
