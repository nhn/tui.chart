/**
 * @fileoverview Test for dataExporter.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartExporter = require('../../src/js/helpers/chartExporter');
var dataExporter = require('../../src/js/helpers/dataExporter');
var downloader = require('../../src/js/helpers/downloader');

describe('Test for dataExporter', function() {
    var fn = function() {};
    var downloadOption = {
        xls: {},
        csv: {},
        png: {},
        jpeg: {}
    };
    var rawData = [];

    if (!chartExporter.isDownloadSupported) {
        return;
    }

    describe('downloadData()', function() {
        beforeEach(function() {
            spyOn(downloader, 'execDownload').and.callFake(fn);
            spyOn(dataExporter, '_get2DArrayFromRawData');
            spyOn(dataExporter, '_makeXlsBodyWithRawData');
            spyOn(dataExporter, '_makeCsvBodyWithRawData');
        });

        it('should download data to xls.', function() {
            var extension = 'xls';

            dataExporter.downloadData('myFile', extension, rawData, downloadOption);
            expect(downloader.execDownload).toHaveBeenCalledWith('myFile', extension, jasmine.any(String));
        });
        it('should download data to csv.', function() {
            var extension = 'csv';

            dataExporter.downloadData('myFile', extension, rawData, downloadOption);
            expect(downloader.execDownload).toHaveBeenCalledWith('myFile', extension, jasmine.any(String));
        });
    });
    describe('_makeCsvTextWithRawData()', function() {
        it('should create csv string.', function() {
            expect(dataExporter._makeCsvBodyWithRawData([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
                .toBe('1%2C2%2C3%0A4%2C5%2C6%0A7%2C8%2C9');
        });

        it('should create csv string with item delimiter.', function() {
            expect(dataExporter._makeCsvBodyWithRawData([[1, 2, 3], [4, 5, 6], [7, 8, 9]], {itemDelimiter: '.'})).toBe('1.2.3%0A4.5.6%0A7.8.9');
        });

        it('should create csv string with line delimiter.', function() {
            expect(dataExporter._makeCsvBodyWithRawData([[1, 2, 3], [4, 5, 6], [7, 8, 9]], {lineDelimiter: '-'})).toBe('1%2C2%2C3-4%2C5%2C6-7%2C8%2C9');
        });

        it('should create csv string with item and line delimiter.', function() {
            expect(dataExporter._makeCsvBodyWithRawData([[1, 2, 3], [4, 5, 6], [7, 8, 9]], {
                itemDelimiter: '.',
                lineDelimiter: '-'
            })).toBe('1.2.3-4.5.6-7.8.9');
        });
    });

    describe('_makeXlsBodyWithRawData()', function() {
        it('should create xls blob string.', function() {
            var actual = dataExporter._makeXlsBodyWithRawData([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            var tableHTML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ark1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta name=ProgId content=Excel.Sheet><meta charset=UTF-8></head><body><table><tr><th class="number">1</th><th>2</th><th>3</th></tr><tr><td class="number">4</td><td class="number">5</td><td class="number">6</td></tr><tr><td class="number">7</td><td class="number">8</td><td class="number">9</td></tr></table></body></html>';

            expect(actual)
                .toBe(window.btoa(tableHTML));
        });
    });

    describe('_get2DArrayFromRawData()', function() {
        var result = [['', 'jan', 'feb'], ['john', 10, 20], ['jane', 30, 25]];
        it('should create 2D array from rawData.', function() {
            expect(dataExporter._get2DArrayFromRawData({
                categories: ['jan', 'feb'],
                series: {
                    line: [{
                        name: 'john',
                        data: [10, 20]
                    }, {
                        name: 'jane',
                        data: [30, 25]
                    }]
                }
            })).toEqual(result);
        });

        it('should create 2D array from heatmap rawData.', function() {
            expect(dataExporter._get2DArrayFromRawData({
                categories: {
                    x: ['jan', 'feb'],
                    y: ['john', 'jane']
                },
                series: {
                    heatMap: [[10, 20], [30, 25]]
                }
            })).toEqual(result);
        });
    });
});
