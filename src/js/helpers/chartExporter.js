/**
 * @fileOverview Chart exporter
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('../helpers/arrayUtil');
var chartConst = require('../const');
var dataExporter = require('./dataExporter');
var imageExporter = require('./imageExporter');

var browser = tui.util.browser;

var isIE10OrIE11 = browser.msie && (browser.version === 10 || browser.version === 11);
var isImageDownloadAvailable = !isIE10OrIE11
    || (isIE10OrIE11 && document.createElement('canvas').getContext('2d').drawSvg);
var isDownloadAttributeSupported = tui.util.isExisty(document.createElement('a').download);
var isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;


/**
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 */
function isImageExtension(extension) {
    return arrayUtil.any(chartConst.IMAGE_EXTENSIONS, function(imageExtension) {
        return extension === imageExtension;
    });
}

/**
 * Download chart data with given export type
 * @param {string} fileName - file name = chart title
 * @param {string} extension - file extension
 * @param {object} rawData - chart raw data
 * @param {HTMLElement} svgElement - svg element
 * @param {object} [downloadOptions] download option
 */
function exportChart(fileName, extension, rawData, svgElement, downloadOptions) {
    var downloadOption = downloadOptions ? downloadOptions[extension] : {};

    if (isImageExtension(extension)) {
        imageExporter.downloadImage(fileName, extension, svgElement);
    } else if (extension === 'xls') {
        dataExporter.downloadData(fileName, extension, rawData, downloadOption);
    }
}

module.exports = {
    exportChart: exportChart,
    isDownloadSupported: isDownloadAttributeSupported || isMsSaveOrOpenBlobSupported,
    isImageDownloadAvailable: isImageDownloadAvailable,
    isImageExtension: isImageExtension
};
