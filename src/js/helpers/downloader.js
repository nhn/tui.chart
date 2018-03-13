/**
 * @fileOverview File downloader for client-side download
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var arrayUtil = require('../helpers/arrayUtil');
var chartConst = require('../const');

var DOWNLOAD_HANDLERS = {
    downloadAttribute: downloadWithAnchorElementDownloadAttribute,
    msSaveOrOpenBlob: downloadWithMsSaveOrOpenBlob
};

/**
 * Return download method name of current browser supports
 * @returns {string}
 * @ignore
 */
function getDownloadMethod() {
    var isDownloadAttributeSupported = snippet.isExisty(document.createElement('a').download);
    var isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;
    var method;

    if (isMsSaveOrOpenBlobSupported) {
        method = 'msSaveOrOpenBlob';
    } else if (isDownloadAttributeSupported) {
        method = 'downloadAttribute';
    }

    return method;
}

/**
 * Base64 string to blob
 * original source ref: https://github.com/miguelmota/base64toblob/blob/master/base64toblob.js
 * Licence: MIT Licence
 * @param {string} base64String - base64 string
 * @returns {Blob}
 * @ignore
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
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isImageExtension(extension) {
    return arrayUtil.any(chartConst.IMAGE_EXTENSIONS, function(imageExtension) {
        return extension === imageExtension;
    });
}

/**
 * Download content to file with msSaveOrOpenBlob
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @param {string} content - file content
 * @ignore
 */
function downloadWithMsSaveOrOpenBlob(fileName, extension, content) {
    var blobObject = isImageExtension(extension) ? base64toBlob(content) : new Blob([content]);

    window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.' + extension);
}

/**
 * Download content to file with anchor element's download attribute
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @param {string} content - file content
 * @ignore
 */
function downloadWithAnchorElementDownloadAttribute(fileName, extension, content) {
    var anchorElement;

    if (content) {
        anchorElement = document.createElement('a');

        anchorElement.href = content;
        anchorElement.target = '_blank';
        anchorElement.download = fileName + '.' + extension;

        document.body.appendChild(anchorElement);

        anchorElement.click();
        anchorElement.remove();
    }
}

/**
 * Download content to file with given filename and extension
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @param {string} content - file content
 * @ignore
 */
function execDownload(fileName, extension, content) {
    var downloadMethod = getDownloadMethod();

    if (downloadMethod && snippet.isString(content)) {
        DOWNLOAD_HANDLERS[downloadMethod](fileName, extension, content);
    }
}

module.exports = {
    execDownload: execDownload
};
