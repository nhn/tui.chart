/**
 * @fileOverview Chart exporter
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import arrayUtil from '../helpers/arrayUtil';
import dataExporter from './dataExporter';
import imageExporter from './imageExporter';
import snippet from 'tui-code-snippet';

const { browser, isExisty, isString } = snippet;

const isIE10OrIE11 = browser.msie && (browser.version === 10 || browser.version === 11);
const isImageDownloadAvailable =
  !isIE10OrIE11 || (isIE10OrIE11 && document.createElement('canvas').getContext('2d').drawSvg);
const isDownloadAttributeSupported = isExisty(document.createElement('a').download);
const isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;

/**
 * Return given extension type is image format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isImageExtension(extension) {
  return arrayUtil.any(
    imageExporter.getExtensions(),
    imageExtension => extension === imageExtension
  );
}
/**
 * Return given extension type is data format
 * @param {string} extension extension
 * @returns {boolean}
 * @ignore
 */
function isDataExtension(extension) {
  return arrayUtil.any(dataExporter.getExtensions(), dataExtension => extension === dataExtension);
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
  const downloadOption =
    downloadOptions && downloadOptions[extension] ? downloadOptions[extension] : {};

  if (isImageExtension(extension)) {
    imageExporter.downloadImage(fileName, extension, svgElement);
  } else if (isDataExtension(extension)) {
    dataExporter.downloadData(fileName, extension, rawData, downloadOption);
  }
}

export default {
  exportChart,
  isDownloadSupported: isDownloadAttributeSupported || isMsSaveOrOpenBlobSupported,
  isImageDownloadAvailable,
  isImageExtension,

  /**
   * Add file extension to dataExtension
   * @param {string} type file extension type
   * @param {string} extension file extension
   */
  addExtension(type, extension) {
    const isValidExtension = extension && isString(extension);
    let exporter;
    let extensions;

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
