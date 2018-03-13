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
    });

    describe('_makeTHeadForBullet()', function() {
        it('should make table head of 2 cells if it only has data property', function() {
            var actual = dataExporter._makeTHeadForBullet(0, 0);

            expect(actual).toEqual(['', 'Actual']);
        });

        it('should make table head containing 1 range cell and 2 marker cells', function() {
            var actual = dataExporter._makeTHeadForBullet(1, 2);

            expect(actual).toEqual(['', 'Actual', 'Ranges0', 'Markers0', 'Markers1']);
        });
    });

    describe('_makeTCellsFromBulletRanges()', function() {
        var actual, ranges, maxRangeCount;

        it('should return array having length of maxRangeCount', function() {
            maxRangeCount = 0;
            actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

            expect(actual).toEqual([]);
            expect(actual.length).toBe(0);
        });

        it('should not return empty array, if ranges is empty and maxRangeCount is natural number', function() {
            ranges = [];
            maxRangeCount = 3;
            actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

            expect(actual).toEqual(['', '', '']);
            expect(actual.length).toBe(3);
        });

        it('should make range data cells using range array', function() {
            ranges = [[-10, 0], [0, 10], [10, 20]];
            maxRangeCount = 3;
            actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

            expect(actual).toEqual(['-10~0', '0~10', '10~20']);
        });
    });

    describe('_makeTCellsFromBulletMarkers()', function() {
        var actual, markers, maxMarkerCount;

        it('should return array having length of maxRangeCount', function() {
            maxMarkerCount = 3;
            actual = dataExporter._makeTCellsFromBulletMarkers(markers, maxMarkerCount);

            expect(actual).toEqual(['', '', '']);
            expect(actual.length).toBe(3);
        });

        it('should make marker data cells using marker array', function() {
            markers = [-5, 5];
            maxMarkerCount = 3;
            actual = dataExporter._makeTCellsFromBulletMarkers(markers, maxMarkerCount);

            expect(actual).toEqual([-5, 5, '']);
        });
    });

    describe('_get2DArrayFromBulletRawData()', function() {
        it('should create 2D array from raw data of bullet chart', function() {
            var actual = dataExporter._get2DArrayFromBulletRawData({
                series: {
                    bullet: [{
                        name: 'series0',
                        data: 25,
                        ranges: [[1, 0]],
                        markers: [13, 15]
                    }, {
                        name: 'series1',
                        data: 13,
                        ranges: [[7, 10], [10, 13]],
                        markers: [15]
                    }]
                }
            }, {
                maxRangeCount: 2,
                maxMarkerCount: 2
            });

            expect(actual).toEqual([
                ['', 'Actual', 'Ranges0', 'Ranges1', 'Markers0', 'Markers1'],
                ['series0', 25, '1~0', '', 13, 15],
                ['series1', 13, '7~10', '10~13', 15, '']
            ]);
        });
    });

    describe('_get2DArrayFromHeatmapRawData()', function() {
        var result = [['', 'jan', 'feb'], ['john', 10, 20], ['jane', 30, 25]];
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
