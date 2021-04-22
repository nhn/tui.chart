import {
  isString,
  isUndefined,
  isNumber,
  includes,
  isNull,
  range,
  getFirstValidValue,
} from '@src/helpers/utils';
import { DataToExport } from '@src/component/exportMenu';
import {
  HeatmapCategoriesType,
  TreemapSeriesType,
  AreaSeriesDataType,
  CoordinateDataType,
  LineSeriesDataType,
  RangeDataType,
  PieSeriesType,
  NestedPieSeriesType,
} from '@t/options';
import { getCoordinateXValue, getCoordinateYValue } from './coordinate';

type ExportData2DArray = (string | number)[][];

export type SpreadSheetExtension = 'csv' | 'xls';
type ImageExtension = 'png' | 'jpeg';
type Extension = SpreadSheetExtension | ImageExtension;

const DATA_URI_HEADERS = {
  xls: 'data:application/vnd.ms-excel;base64,',
  csv: 'data:text/csv;charset=utf-8,%EF%BB%BF' /* BOM for utf-8 */,
};

function getDownloadMethod() {
  let method;

  const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
  const isMSSaveOrOpenBlobSupported = !isUndefined(
    window.Blob && window.navigator.msSaveOrOpenBlob
  );

  if (isMSSaveOrOpenBlobSupported) {
    method = downloadWithMSSaveOrOpenBlob;
  } else if (isDownloadAttributeSupported) {
    method = downloadWithAnchorElementDownloadAttribute;
  }

  return method;
}

/**
 * Base64 string to blob
 * original source ref: https://github.com/miguelmota/base64toblob/blob/master/base64toblob.js
 * Licence: MIT Licence
 */
function base64toBlob(base64String: string) {
  const contentType = base64String
    .substr(0, base64String.indexOf(';base64,'))
    .substr(base64String.indexOf(':') + 1);
  const sliceSize = 1024;
  const byteCharacters = atob(base64String.substr(base64String.indexOf(',') + 1));
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new window.Uint8Array(byteNumbers));
  }

  try {
    // for IE 11
    return new Blob(byteArrays, { type: contentType });
  } catch (e) {
    // for IE 10
    return new Blob(
      byteArrays.map((byteArr) => byteArr.buffer),
      { type: contentType }
    );
  }
}

function isImageExtension(extension: Extension) {
  return extension === 'jpeg' || extension === 'png';
}

function downloadWithMSSaveOrOpenBlob(
  fileName: string,
  extension: Extension,
  content: string,
  contentType?: string
) {
  const blobObject = isImageExtension(extension)
    ? base64toBlob(content)
    : new Blob([content], { type: contentType });
  window.navigator.msSaveOrOpenBlob(blobObject, `${fileName}.${extension}`);
}

function downloadWithAnchorElementDownloadAttribute(
  fileName: string,
  extension: Extension,
  content?: string
) {
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

function oneLineTrim(...args: [TemplateStringsArray, string]) {
  const normalTag = (template, ...expressions) =>
    template.reduce((accumulator, part, i) => accumulator + expressions[i - 1] + part);

  return normalTag(...args).replace(/\n\s*/g, '');
}

function isNeedDataEncoding() {
  const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
  const isMSSaveOrOpenBlobSupported = !isUndefined(
    window.Blob && window.navigator.msSaveOrOpenBlob
  );

  return !isMSSaveOrOpenBlobSupported && isDownloadAttributeSupported;
}

function getBulletLongestArrayLength(arr: any[], field: string): number {
  return arr.reduce(
    (acc, cur, idx) => (!idx || acc < cur?.[field]?.length ? cur[field].length : acc),
    0
  );
}

function makeBulletExportData({ series }: DataToExport): ExportData2DArray {
  const seriesData = series.bullet!.data;
  const markerCount = getBulletLongestArrayLength(seriesData, 'markers');
  const rangeCount = getBulletLongestArrayLength(seriesData, 'ranges');
  const rangesHeaders = range(0, rangeCount).map((idx) => `Range ${idx + 1}`);
  const markerHeaders = range(0, markerCount).map((idx) => `Marker ${idx + 1}`);

  return seriesData.reduce<ExportData2DArray>(
    (acc, { data, markers, name, ranges }) => {
      const rangeDatum = rangesHeaders.map((_, index) => {
        const rangeData = ranges?.[index];

        return rangeData ? `${rangeData[0]} ~ ${rangeData[1]}` : '';
      });
      const markerDatum = markerHeaders.map((_, index) => markers?.[index] ?? '');

      return [...acc, [name, data ?? '', ...rangeDatum, ...markerDatum]];
    },
    [['', 'Actual', ...rangesHeaders, ...markerHeaders]]
  );
}

function makeHeatmapExportData({ categories, series }: DataToExport): ExportData2DArray {
  const xCategories = (categories as HeatmapCategoriesType).x;

  return series.heatmap!.data.reduce<ExportData2DArray>(
    (acc, { data, yCategory }) => [
      ...acc,
      [yCategory, ...data.map((datum) => (isNull(datum) ? '' : datum))],
    ],
    [['', ...xCategories]]
  );
}

function recursiveTreemapData(
  { label, data, children = [] }: TreemapSeriesType,
  result: ExportData2DArray
) {
  if (data) {
    result.push([label, data]);
  }

  children.forEach((childrenData) => recursiveTreemapData(childrenData, result));

  return result;
}

function makeTreemapExportData(exportData: DataToExport) {
  const { series } = exportData;
  const result: ExportData2DArray = [['Label', 'Data']];

  series.treemap!.data.forEach((datum) => {
    recursiveTreemapData(datum, result);
  });

  return result;
}

function makeBubbleExportData(exportData: DataToExport): ExportData2DArray {
  const { series } = exportData;

  return series.bubble!.data.reduce<ExportData2DArray>(
    (acc, { name, data }) => [
      ...acc,
      ...data.map((datum) =>
        isNull(datum) ? [] : [name, datum.label, String(datum.x), datum.y, datum.r]
      ),
    ],
    [['Name', 'Label', 'X', 'Y', 'Radius']]
  );
}

function makeBoxPlotExportData(exportData: DataToExport): ExportData2DArray {
  const { series } = exportData;
  const categories = (exportData.categories ?? []) as string[];

  return series.boxPlot!.data.reduce<ExportData2DArray>(
    (acc, { name, data, outliers }) => {
      const values = (data ?? []).map((rawData, index) => {
        const outlierValue = (outliers ?? []).find((outlier) => outlier[0] === index)?.[1];
        const value = outlierValue ? [...rawData, outlierValue] : [...rawData];

        return value.join();
      });

      return [...acc, [name, ...values]];
    },
    [['', ...categories]]
  );
}

function makePieExportData(exportData: DataToExport): ExportData2DArray {
  const { series } = exportData;
  const categories = (exportData.categories ?? []) as string[];

  return (series.pie!.data as Array<PieSeriesType | NestedPieSeriesType>).reduce<ExportData2DArray>(
    (acc, { name, data }) => {
      const values = Array.isArray(data)
        ? (data ?? []).reduce<ExportData2DArray>((accNestedPieValue, value) => {
            return [...accNestedPieValue, [value.name, value.data ?? '']];
          }, [])
        : [[name, data ?? '']];

      return [...acc, ...values];
    },
    (categories as string[]).length ? [['', ...categories]] : []
  );
}

function makeCoordinateExportDataValues(
  type: string,
  categories: string[],
  data: Array<LineSeriesDataType | CoordinateDataType | AreaSeriesDataType>
) {
  return categories.map((category, index) => {
    if (type === 'area' && Array.isArray(data[index])) {
      return (data[index] as RangeDataType<number>).join();
    }

    const foundItem = data.find(
      (value) => category === String(getCoordinateXValue(value as CoordinateDataType))
    );

    return foundItem ? getCoordinateYValue(foundItem) : '';
  });
}

function makeExportData(exportData: DataToExport): ExportData2DArray {
  const { series } = exportData;
  const categories = exportData.categories as string[];

  return Object.keys(series).reduce<ExportData2DArray>(
    (acc, type) => {
      const result = series[type].data.map(({ name, data }) => {
        const values =
          !isNumber(getFirstValidValue(data)) && includes(['line', 'area', 'scatter'], type)
            ? makeCoordinateExportDataValues(type, categories, data)
            : data.map((value) => (Array.isArray(value) ? value.join() : value));

        return [name, ...values];
      });

      return [...acc, ...result];
    },
    series.gauge ? [] : [['', ...categories]]
  );
}

function get2DArrayFromRawData(exportData: DataToExport) {
  let result: ExportData2DArray;
  const { series } = exportData;

  if (series.bullet) {
    result = makeBulletExportData(exportData);
  } else if (series.heatmap) {
    result = makeHeatmapExportData(exportData);
  } else if (series.bubble) {
    result = makeBubbleExportData(exportData);
  } else if (series.boxPlot) {
    result = makeBoxPlotExportData(exportData);
  } else if (series.pie) {
    result = makePieExportData(exportData);
  } else if (series.treemap) {
    result = makeTreemapExportData(exportData);
  } else {
    result = makeExportData(exportData);
  }

  return result;
}

function getTableElementStringForXLS(chartData2DArray: ExportData2DArray) {
  let tableElementString = '<table>';
  chartData2DArray.forEach((row, rowIndex) => {
    const cellTagName = rowIndex === 0 ? 'th' : 'td';

    tableElementString += '<tr>';

    row.forEach((cell, cellIndex) => {
      const cellNumberClass = rowIndex !== 0 || cellIndex === 0 ? ' class="number"' : '';
      const cellString = `<${cellTagName}${cellNumberClass}>${cell}</${cellTagName}>`;

      tableElementString += cellString;
    });

    tableElementString += '</tr>';
  });

  tableElementString += '</table>';

  return tableElementString;
}

function makeXLSBodyWithRawData(chartData2DArray: ExportData2DArray) {
  return oneLineTrim`<html xmlns:o="urn:schemas-microsoft-com:office:office"
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
            ${getTableElementStringForXLS(chartData2DArray)}
        </body>
        </html>`;
}

function makeCSVBodyWithRawData(
  chartData2DArray: ExportData2DArray,
  option: { lineDelimiter?: string; itemDelimiter?: string } = {}
) {
  const { lineDelimiter = '\u000a', itemDelimiter = ',' } = option;
  const lastRowIndex = chartData2DArray.length - 1;
  let csvText = '';

  chartData2DArray.forEach((row, rowIndex) => {
    const lastCellIndex = row.length - 1;

    row.forEach((cell, cellIndex) => {
      const cellContent = isNumber(cell) ? cell : `"${cell}"`;

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

export function execDownload(
  fileName: string,
  extension: Extension,
  content: string,
  contentType?: string
) {
  const downloadMethod = getDownloadMethod();
  if (!isString(content) || !downloadMethod) {
    return;
  }

  downloadMethod(fileName, extension, content, contentType);
}

export function downloadSpreadSheet(
  fileName: string,
  extension: SpreadSheetExtension,
  data: DataToExport
) {
  const chartData2DArray = get2DArrayFromRawData(data);
  const contentType = DATA_URI_HEADERS[extension].replace(/(data:|;base64,|,%EF%BB%BF)/g, '');
  let content = '';

  if (extension === 'csv') {
    content = makeCSVBodyWithRawData(chartData2DArray);
  } else {
    content = makeXLSBodyWithRawData(chartData2DArray);
  }

  if (isNeedDataEncoding()) {
    if (extension !== 'csv') {
      // base64 encoding for data URI scheme.
      content = window.btoa(unescape(encodeURIComponent(content)));
    }
    content = DATA_URI_HEADERS[extension] + content;
  }

  execDownload(fileName, extension, content, contentType);
}
