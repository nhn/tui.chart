/**
 * @fileOverview Chart data exporter
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import downloader from './downloader';
import chartConst from '../const';
import renderUtil from '../helpers/renderUtil';
import snippet from 'tui-code-snippet';

const DATA_URI_HEADERS = {
  xls: 'data:application/vnd.ms-excel;base64,',
  csv: 'data:text/csv;charset=utf-8,%EF%BB%BF' /* BOM for utf-8 */
};
const DATA_URI_BODY_MAKERS = {
  xls: _makeXlsBodyWithRawData,
  csv: _makeCsvBodyWithRawData
};
const dataExtensions = [...chartConst.DATA_EXTENSIONS];

const dataExporter = {
  /**
   * Download chart data
   * @param {string} fileName file name
   * @param {string} extension file extension
   * @param {object} rawData raw data of chart
   * @param {object} [downloadOption] download option
   */
  downloadData(fileName, extension, rawData, downloadOption) {
    const chartData2DArray = _get2DArrayFromRawData(rawData);
    const contentType = DATA_URI_HEADERS[extension].replace(/(data:|;base64,|,%EF%BB%BF)/g, '');
    let content = DATA_URI_BODY_MAKERS[extension](chartData2DArray, downloadOption);

    if (this._isNeedDataEncodeing()) {
      if (extension !== 'csv') {
        // base64 encoding for data URI scheme.
        content = window.btoa(unescape(encodeURIComponent(content)));
      }
      content = DATA_URI_HEADERS[extension] + content;
    }

    downloader.execDownload(fileName, extension, content, contentType);
  },

  /**
   * Whether need encode type or not
   * @returns {boolean}
   * @private
   */
  _isNeedDataEncodeing() {
    const isDownloadAttributeSupported = snippet.isExisty(document.createElement('a').download);
    const isMsSaveOrOpenBlobSupported = window.Blob && window.navigator.msSaveOrOpenBlob;

    if (!isMsSaveOrOpenBlobSupported && isDownloadAttributeSupported) {
      return true;
    }

    return false;
  },

  /**
   * Returns data extensions
   * @returns {Array.<string>}
   */
  getExtensions() {
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
  const resultArray = [];
  const isHeatMap = rawData.categories && snippet.isExisty(rawData.categories.x);
  const isBullet = rawData.series && snippet.isExisty(rawData.series.bullet);
  let return2DArrayData = false;

  if (rawData) {
    let categories;

    if (isHeatMap) {
      return2DArrayData = _get2DArrayFromHeatmapRawData(rawData);
    } else if (isBullet) {
      return2DArrayData = _get2DArrayFromBulletRawData(rawData);
    } else if (rawData.categories) {
      ({ categories } = rawData);
    }
    if (return2DArrayData) {
      return return2DArrayData;
    }

    resultArray.push([''].concat(categories));

    Object.values(rawData.series || {}).forEach(seriesDatum => {
      seriesDatum.forEach(seriesItem => {
        const data = snippet.isArray(seriesItem.data) ? seriesItem.data : [seriesItem.data];

        resultArray.push([seriesItem.name, ...data]);
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
  const tableHead = ['', chartConst.BULLET_TYPE_ACTUAL];

  for (let i = 0; i < maxRangeCount; i += 1) {
    tableHead.push(chartConst.BULLET_TYPE_RANGE + i);
  }

  for (let i = 0; i < maxMarkerCount; i += 1) {
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
  const cells = [];

  for (let i = 0; i < maxRangeCount; i += 1) {
    let dataText = '';

    if (ranges && ranges[i]) {
      const rangeStart = ranges[i].length > 0 ? ranges[i][0] : '';
      const rangeEnd = ranges[i].length > 1 ? ranges[i][1] : '';

      dataText = `${rangeStart}~${rangeEnd}`;
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
  const cells = [];

  for (let i = 0; i < maxMarkerCount; i += 1) {
    const dataText = markers && markers[i] ? markers[i] : '';
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
  const resultArray = [];
  const maxCounts = _calculateMaxCounts(rawData.series.bullet);
  const { maxRangeCount, maxMarkerCount } = maxCounts;

  resultArray.push(_makeTHeadForBullet(maxRangeCount, maxMarkerCount));

  snippet.forEach(rawData.series.bullet, seriesItem => {
    const rangeArray = _makeTCellsFromBulletRanges(seriesItem.ranges, maxRangeCount);
    const markerArray = _makeTCellsFromBulletMarkers(seriesItem.markers, maxMarkerCount);
    const row = [seriesItem.name, seriesItem.data, ...rangeArray, ...markerArray];
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
  let maxRangeCount = 0;
  let maxMarkerCount = 0;

  snippet.forEach(bulletSeries, series => {
    maxRangeCount = Math.max(maxRangeCount, series.ranges.length);
    maxMarkerCount = Math.max(maxMarkerCount, series.markers.length);
  });

  return {
    maxRangeCount,
    maxMarkerCount
  };
}

/**
 * Make table data for importing in excel, by using heatmap chart raw data
 * @param {object} rawData - raw data
 * @returns {Array.<Array.<string>>} - table data for importing in excel
 * @private
 */
function _get2DArrayFromHeatmapRawData(rawData) {
  const resultArray = [];

  resultArray.push(['', ...rawData.categories.x]);

  snippet.forEach(rawData.series, seriesDatum => {
    snippet.forEach(seriesDatum, (seriesItem, index) => {
      const row = [rawData.categories.y[index], ...seriesItem];
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
  let tableElementString = '<table>';
  snippet.forEach(chartData2DArray, (row, rowIndex) => {
    const cellTagName = rowIndex === 0 ? 'th' : 'td';

    tableElementString += '<tr>';

    snippet.forEach(row, (cell, cellIndex) => {
      const cellNumberClass = rowIndex !== 0 || cellIndex === 0 ? ' class="number"' : '';
      const cellString = `<${cellTagName}${cellNumberClass}>${cell}</${cellTagName}>`;

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
  const xlsString = renderUtil.oneLineTrim`<html xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:x="urn:schemas-microsoft-com:office:excel" 
        xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Ark1</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                        </x:ExcelWorkbook>
                </xml>
            <![endif]-->
            <meta name=ProgId content=Excel.Sheet>
            <meta charset=UTF-8>
        </head>
        <body>
            ${_getTableElementStringForXls(chartData2DArray)}
        </body>
        </html>`;

  return xlsString;
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
function _makeCsvBodyWithRawData(chartData2DArray, option = {}) {
  const { lineDelimiter = '\u000a', itemDelimiter = ',' } = option;
  const lastRowIndex = chartData2DArray.length - 1;
  let csvText = '';

  snippet.forEachArray(chartData2DArray, (row, rowIndex) => {
    const lastCellIndex = row.length - 1;

    snippet.forEachArray(row, (cell, cellIndex) => {
      const cellContent = snippet.isNumber(cell) ? cell : `"${cell}"`;

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

// export private methods for Test
Object.assign(dataExporter, {
  _makeCsvBodyWithRawData,
  _makeXlsBodyWithRawData,
  _get2DArrayFromRawData,
  _get2DArrayFromBulletRawData,
  _get2DArrayFromHeatmapRawData,
  _makeTCellsFromBulletRanges,
  _makeTCellsFromBulletMarkers,
  _makeTHeadForBullet
});

export default dataExporter;
