/**
 * @fileOverview File downloader for client-side download
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import arrayUtil from '../helpers/arrayUtil';
import chartConst from '../const';

const DOWNLOAD_HANDLERS = {
  downloadAttribute: downloadWithAnchorElementDownloadAttribute,
  msSaveOrOpenBlob: downloadWithMsSaveOrOpenBlob
};

/**
 * Return download method name of current browser supports
 * @returns {string}
 * @ignore
 */
function getDownloadMethod() {
  const isDownloadAttributeSupported = snippet.isExisty(document.createElement('a').download);
  const isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;
  let method;

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
  const contentType = base64String
    .substr(0, base64String.indexOf(';base64,'))
    .substr(base64String.indexOf(':') + 1);
  const sliceSize = 1024;
  const byteCharacters = atob(base64String.substr(base64String.indexOf(',') + 1));
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new window.Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const resultBlob = new Blob(byteArrays, { type: contentType });

  return resultBlob;
}

/**
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isImageExtension(extension) {
  return arrayUtil.any(chartConst.IMAGE_EXTENSIONS, imageExtension => extension === imageExtension);
}

/**
 * Download content to file with msSaveOrOpenBlob
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @param {string} content - file content
 * @param {string} contentType - file content type
 * @ignore
 */
function downloadWithMsSaveOrOpenBlob(fileName, extension, content, contentType) {
  const blobObject = isImageExtension(extension)
    ? base64toBlob(content)
    : new Blob([content], { type: contentType });
  window.navigator.msSaveOrOpenBlob(blobObject, `${fileName}.${extension}`);
}

/**
 * Download content to file with anchor element's download attribute
 * @param {string} fileName - file name
 * @param {string} extension - file extension
 * @param {string} content - file content
 * @ignore
 */
function downloadWithAnchorElementDownloadAttribute(fileName, extension, content) {
  if (content) {
    const anchorElement = document.createElement('a');

    anchorElement.href = content;
    anchorElement.target = '_blank';
    anchorElement.download = `${fileName}.${extension}`;

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
 * @param {string} contentType - file content type
 * @ignore
 */
function execDownload(fileName, extension, content, contentType) {
  const downloadMethod = getDownloadMethod();

  if (downloadMethod && snippet.isString(content)) {
    DOWNLOAD_HANDLERS[downloadMethod](fileName, extension, content, contentType);
  }
}

export default {
  execDownload
};
