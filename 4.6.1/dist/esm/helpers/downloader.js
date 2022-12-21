import { isString, isUndefined, isNumber, includes, isNull, range, getFirstValidValue, } from "./utils";
import { getCoordinateXValue, getCoordinateYValue } from "./coordinate";
const DATA_URI_HEADERS = {
    xls: 'data:application/vnd.ms-excel;base64,',
    csv: 'data:text/csv;charset=utf-8,%EF%BB%BF' /* BOM for utf-8 */,
};
function getDownloadMethod() {
    let method;
    const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
    const isMSSaveOrOpenBlobSupported = !isUndefined(window.Blob && window.navigator.msSaveOrOpenBlob);
    if (isMSSaveOrOpenBlobSupported) {
        method = downloadWithMSSaveOrOpenBlob;
    }
    else if (isDownloadAttributeSupported) {
        method = downloadWithAnchorElementDownloadAttribute;
    }
    return method;
}
/**
 * Base64 string to blob
 * original source ref: https://github.com/miguelmota/base64toblob/blob/master/base64toblob.js
 * Licence: MIT Licence
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
        byteArrays.push(new window.Uint8Array(byteNumbers));
    }
    try {
        // for IE 11
        return new Blob(byteArrays, { type: contentType });
    }
    catch (e) {
        // for IE 10
        return new Blob(byteArrays.map((byteArr) => byteArr.buffer), { type: contentType });
    }
}
function isImageExtension(extension) {
    return extension === 'jpeg' || extension === 'png';
}
function downloadWithMSSaveOrOpenBlob(fileName, extension, content, contentType) {
    const blobObject = isImageExtension(extension)
        ? base64toBlob(content)
        : new Blob([content], { type: contentType });
    window.navigator.msSaveOrOpenBlob(blobObject, `${fileName}.${extension}`);
}
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
function oneLineTrim(...args) {
    const normalTag = (template, ...expressions) => template.reduce((accumulator, part, i) => accumulator + expressions[i - 1] + part);
    return normalTag(...args).replace(/\n\s*/g, '');
}
function isNeedDataEncoding() {
    const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
    const isMSSaveOrOpenBlobSupported = !isUndefined(window.Blob && window.navigator.msSaveOrOpenBlob);
    return !isMSSaveOrOpenBlobSupported && isDownloadAttributeSupported;
}
function getBulletLongestArrayLength(arr, field) {
    return arr.reduce((acc, cur, idx) => { var _a, _b; return (!idx || acc < ((_b = (_a = cur) === null || _a === void 0 ? void 0 : _a[field]) === null || _b === void 0 ? void 0 : _b.length) ? cur[field].length : acc); }, 0);
}
function makeBulletExportData({ series }) {
    const seriesData = series.bullet.data;
    const markerCount = getBulletLongestArrayLength(seriesData, 'markers');
    const rangeCount = getBulletLongestArrayLength(seriesData, 'ranges');
    const rangesHeaders = range(0, rangeCount).map((idx) => `Range ${idx + 1}`);
    const markerHeaders = range(0, markerCount).map((idx) => `Marker ${idx + 1}`);
    return seriesData.reduce((acc, { data, markers, name, ranges }) => {
        const rangeDatum = rangesHeaders.map((_, index) => {
            var _a;
            const rangeData = (_a = ranges) === null || _a === void 0 ? void 0 : _a[index];
            return rangeData ? `${rangeData[0]} ~ ${rangeData[1]}` : '';
        });
        const markerDatum = markerHeaders.map((_, index) => { var _a, _b; return _b = (_a = markers) === null || _a === void 0 ? void 0 : _a[index], (_b !== null && _b !== void 0 ? _b : ''); });
        return [...acc, [name, (data !== null && data !== void 0 ? data : ''), ...rangeDatum, ...markerDatum]];
    }, [['', 'Actual', ...rangesHeaders, ...markerHeaders]]);
}
function makeHeatmapExportData({ categories, series }) {
    const xCategories = categories.x;
    return series.heatmap.data.reduce((acc, { data, yCategory }) => [
        ...acc,
        [yCategory, ...data.map((datum) => (isNull(datum) ? '' : datum))],
    ], [['', ...xCategories]]);
}
function recursiveTreemapData({ label, data, children = [] }, result) {
    if (data) {
        result.push([label, data]);
    }
    children.forEach((childrenData) => recursiveTreemapData(childrenData, result));
    return result;
}
function makeTreemapExportData(exportData) {
    const { series } = exportData;
    const result = [['Label', 'Data']];
    series.treemap.data.forEach((datum) => {
        recursiveTreemapData(datum, result);
    });
    return result;
}
function makeBubbleExportData(exportData) {
    const { series } = exportData;
    return series.bubble.data.reduce((acc, { name, data }) => [
        ...acc,
        ...data.map((datum) => isNull(datum) ? [] : [name, datum.label, String(datum.x), datum.y, datum.r]),
    ], [['Name', 'Label', 'X', 'Y', 'Radius']]);
}
function makeBoxPlotExportData(exportData) {
    var _a;
    const { series } = exportData;
    const categories = (_a = exportData.categories, (_a !== null && _a !== void 0 ? _a : []));
    return series.boxPlot.data.reduce((acc, { name, data, outliers }) => {
        const values = ((data !== null && data !== void 0 ? data : [])).map((rawData, index) => {
            var _a;
            const outlierValue = (_a = ((outliers !== null && outliers !== void 0 ? outliers : [])).find((outlier) => outlier[0] === index)) === null || _a === void 0 ? void 0 : _a[1];
            const value = outlierValue ? [...rawData, outlierValue] : [...rawData];
            return value.join();
        });
        return [...acc, [name, ...values]];
    }, [['', ...categories]]);
}
function makePieExportData(exportData) {
    var _a;
    const { series } = exportData;
    const categories = (_a = exportData.categories, (_a !== null && _a !== void 0 ? _a : []));
    return series.pie.data.reduce((acc, { name, data }) => {
        const values = Array.isArray(data)
            ? ((data !== null && data !== void 0 ? data : [])).reduce((accNestedPieValue, value) => {
                var _a;
                return [...accNestedPieValue, [value.name, (_a = value.data, (_a !== null && _a !== void 0 ? _a : ''))]];
            }, [])
            : [[name, (data !== null && data !== void 0 ? data : '')]];
        return [...acc, ...values];
    }, categories.length ? [['', ...categories]] : []);
}
function makeCoordinateExportDataValues(type, categories, data) {
    return categories.map((category, index) => {
        if (type === 'area' && Array.isArray(data[index])) {
            return data[index].join();
        }
        const foundItem = data.find((value) => category === String(getCoordinateXValue(value)));
        return foundItem ? getCoordinateYValue(foundItem) : '';
    });
}
function makeExportData(exportData) {
    const { series } = exportData;
    const categories = exportData.categories;
    return Object.keys(series).reduce((acc, type) => {
        const result = series[type].data.map(({ name, data }) => {
            const values = !isNumber(getFirstValidValue(data)) && includes(['line', 'area', 'scatter'], type)
                ? makeCoordinateExportDataValues(type, categories, data)
                : data.map((value) => (Array.isArray(value) ? value.join() : value));
            return [name, ...values];
        });
        return [...acc, ...result];
    }, series.gauge ? [] : [['', ...categories]]);
}
function get2DArrayFromRawData(exportData) {
    let result;
    const { series } = exportData;
    if (series.bullet) {
        result = makeBulletExportData(exportData);
    }
    else if (series.heatmap) {
        result = makeHeatmapExportData(exportData);
    }
    else if (series.bubble) {
        result = makeBubbleExportData(exportData);
    }
    else if (series.boxPlot) {
        result = makeBoxPlotExportData(exportData);
    }
    else if (series.pie) {
        result = makePieExportData(exportData);
    }
    else if (series.treemap) {
        result = makeTreemapExportData(exportData);
    }
    else {
        result = makeExportData(exportData);
    }
    return result;
}
function getTableElementStringForXLS(chartData2DArray) {
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
function makeXLSBodyWithRawData(chartData2DArray) {
    return oneLineTrim `<html xmlns:o="urn:schemas-microsoft-com:office:office"
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
function makeCSVBodyWithRawData(chartData2DArray, option = {}) {
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
export function execDownload(fileName, extension, content, contentType) {
    const downloadMethod = getDownloadMethod();
    if (!isString(content) || !downloadMethod) {
        return;
    }
    downloadMethod(fileName, extension, content, contentType);
}
export function downloadSpreadSheet(fileName, extension, data) {
    const chartData2DArray = get2DArrayFromRawData(data);
    const contentType = DATA_URI_HEADERS[extension].replace(/(data:|;base64,|,%EF%BB%BF)/g, '');
    let content = '';
    if (extension === 'csv') {
        content = encodeURIComponent(makeCSVBodyWithRawData(chartData2DArray));
    }
    else {
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
