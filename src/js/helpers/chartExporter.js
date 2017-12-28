/**
 * @fileOverview Chart exporter
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('../helpers/arrayUtil');
var dataExporter = require('./dataExporter');
var imageExporter = require('./imageExporter');
var snippet = require('tui-code-snippet');

var browser = snippet.browser;

var isIE10OrIE11 = browser.msie && (browser.version === 10 || browser.version === 11);
var isImageDownloadAvailable = !isIE10OrIE11
    || (isIE10OrIE11 && document.createElement('canvas').getContext('2d').drawSvg);
var isDownloadAttributeSupported = snippet.isExisty(document.createElement('a').download);
var isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;

/**
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isImageExtension(extension) {
    return arrayUtil.any(imageExporter.getExtensions(), function(imageExtension) {
        return extension === imageExtension;
    });
}
/**
 * Return given extension type is data format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isDataExtension(extension) {
    return arrayUtil.any(dataExporter.getExtensions(), function(dataExtension) {
        return extension === dataExtension;
    });
}

/**
 * Download chart data with given export type
 * @param {string} fileName - file name = chart title
 * @param {string} extension - file extension
 * @param {object} rawData - chart raw data
 * @param {HTMLElement} svgElement - svg element
 * @param {object} [downloadOptions] download option
 * @ignore
 */
function exportChart(fileName, extension, rawData, svgElement, downloadOptions) {
    var downloadOption = (downloadOptions && downloadOptions[extension] ? downloadOptions[extension] : {});

    if (isImageExtension(extension)) {
        imageExporter.downloadImage(fileName, extension, svgElement);
    } else if (isDataExtension(extension)) {
        dataExporter.downloadData(fileName, extension, rawData, downloadOption);
    }
}

module.exports = {
    exportChart: exportChart,
    isDownloadSupported: isDownloadAttributeSupported || isMsSaveOrOpenBlobSupported,
    isImageDownloadAvailable: isImageDownloadAvailable,
    isImageExtension: isImageExtension,

    /**
     * Add file extension to dataExtension
     * @param {string} type file extension type
     * @param {string} extension file extension
     */
    addExtension: function(type, extension) {
        var isValidExtension = extension && snippet.isString(extension);
        var exporter, extensions;

        if (type === 'data') {
            exporter = dataExporter;
        } else if (type === 'image') {
            exporter = imageExporter;
        }

        if (exporter && isValidExtension) {
            extensions = exporter.getExtensions();
            extensions.push(extension);
        }
    }
};
