/**
 * @fileOverview Chart image exporter
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import downloader from './downloader';
import chartConst from '../const';
import snippet from 'tui-code-snippet';

const { browser } = snippet;
const isIE10OrIE11 = browser.msie && (browser.version === 10 || browser.version === 11);
const DOMURL = window.URL || window.webkitURL || window;
const imageExtensions = [...chartConst.IMAGE_EXTENSIONS];

/**
 * Return svg outerHTML string
 * @param {HTMLElement} svgElement svg element
 * @returns {string}
 * @ignore
 */
function getSvgString(svgElement) {
  let svgParent = svgElement.parentNode;
  let tempWrapper = document.createElement('DIV');

  tempWrapper.appendChild(svgElement);

  const svgString = tempWrapper.innerHTML;

  svgParent.appendChild(svgElement);

  tempWrapper = null;
  svgParent = null;

  return svgString;
}

/**
 * Download with SVG string and canvg
 * @param {HTMLElement} canvas canvas element
 * @param {string} svgString svg HTML string
 * @param {string} fileName file name
 * @param {string} extension file extension
 * @ignore
 */
function downloadSvgWithCanvg(canvas, svgString, fileName, extension) {
  const ctx = canvas.getContext('2d');

  // remove name space for IE
  if (isIE10OrIE11) {
    svgString = svgString.replace(/xmlns:NS1=""/, '');
    svgString = svgString.replace(/NS1:xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/, '');
    svgString = svgString.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '');
    svgString = svgString.replace(/xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/, '');
  }

  ctx.drawSvg(svgString, 0, 0);

  downloader.execDownload(fileName, extension, canvas.toDataURL(`image/${extension}`, 1));
}

/**
 * Download with SVG string and blob URL
 * @param {HTMLElement} canvas canvas element
 * @param {string} svgString svg HTML string
 * @param {string} fileName file name
 * @param {string} extension file extension
 * @ignore
 */
function downloadSvgWithBlobURL(canvas, svgString, fileName, extension) {
  const ctx = canvas.getContext('2d');
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = DOMURL.createObjectURL(blob);
  const img = new Image();

  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    downloader.execDownload(fileName, extension, canvas.toDataURL(`image/${extension}`, 1));

    DOMURL.revokeObjectURL(url);
  };

  img.src = url;
}

export default {
  /**
   * Download image with png format
   * @param {string} fileName - file name to save
   * @param {string} extension - extension type
   * @param {HTMLElement} imageSourceElement - image source element
   */
  downloadImage(fileName, extension, imageSourceElement) {
    let canvas;

    if (imageSourceElement.tagName === 'svg') {
      const { parentNode } = imageSourceElement;
      const svgString = getSvgString(imageSourceElement);

      canvas = document.createElement('canvas');

      canvas.width = parentNode.offsetWidth;
      canvas.height = parentNode.offsetHeight;

      if (isIE10OrIE11) {
        downloadSvgWithCanvg(canvas, svgString, fileName, extension);
      } else {
        downloadSvgWithBlobURL(canvas, svgString, fileName, extension);
      }
    } else if (imageSourceElement.tagName === 'canvas') {
      canvas = imageSourceElement;

      downloader.execDownload(fileName, extension, canvas.toDataURL(`image/${extension}`, 1));
    }
  },

  /**
   * Returns data extensions
   * @returns {Array.<string>}
   */
  getExtensions() {
    return imageExtensions;
  }
};
