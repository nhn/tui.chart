/**
 * @fileoverview Test for dataExporter.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartExporter from '../../src/js/helpers/chartExporter';
import dataExporter from '../../src/js/helpers/dataExporter';
import downloader from '../../src/js/helpers/downloader';

describe('Test for dataExporter', () => {
  const fn = () => {};
  const downloadOption = {
    xls: {},
    csv: {},
    png: {},
    jpeg: {}
  };
  const rawData = [];

  if (!chartExporter.isDownloadSupported) {
    return;
  }

  describe('downloadData()', () => {
    beforeEach(() => {
      spyOn(dataExporter, '_get2DArrayFromRawData');
      spyOn(dataExporter, '_makeXlsBodyWithRawData');
      spyOn(dataExporter, '_makeCsvBodyWithRawData');
    });

    it('should download data to xls.', () => {
      const extension = 'xls';
      spyOn(downloader, 'execDownload').and.callFake(fn);

      dataExporter.downloadData('myFile', extension, rawData, downloadOption);
      expect(downloader.execDownload).toHaveBeenCalledWith(
        'myFile',
        extension,
        jasmine.any(String),
        'application/vnd.ms-excel'
      );
    });
    it('should download data to csv.', () => {
      const extension = 'csv';
      spyOn(downloader, 'execDownload').and.callFake(fn);

      dataExporter.downloadData('myFile', extension, rawData, downloadOption);
      expect(downloader.execDownload).toHaveBeenCalledWith(
        'myFile',
        extension,
        jasmine.any(String),
        'text/csv;charset=utf-8'
      );
    });

    it('should encoding data to xls.', () => {
      spyOn(downloader, 'execDownload');
      spyOn(dataExporter, '_isNeedDataEncodeing').and.returnValue(true);

      const expected =
        'data:application/vnd.ms-excel;base64,PGh0bWwgeG1sbnM6bz0idXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTpvZmZpY2U6b2ZmaWNlIiB4bWxuczp4PSJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOm9mZmljZTpleGNlbCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAiPjxoZWFkPjwhLS1baWYgZ3RlIG1zbyA5XT48eG1sPjx4OkV4Y2VsV29ya2Jvb2s+PHg6RXhjZWxXb3Jrc2hlZXRzPjx4OkV4Y2VsV29ya3NoZWV0Pjx4Ok5hbWU+QXJrMTwveDpOYW1lPjx4OldvcmtzaGVldE9wdGlvbnM+PHg6RGlzcGxheUdyaWRsaW5lcy8+PC94OldvcmtzaGVldE9wdGlvbnM+PC94OkV4Y2VsV29ya3NoZWV0PjwveDpFeGNlbFdvcmtzaGVldHM+PC94OkV4Y2VsV29ya2Jvb2s+PC94bWw+PCFbZW5kaWZdLS0+PG1ldGEgbmFtZT1Qcm9nSWQgY29udGVudD1FeGNlbC5TaGVldD48bWV0YSBjaGFyc2V0PVVURi04PjwvaGVhZD48Ym9keT48dGFibGU+PHRyPjx0aCBjbGFzcz0ibnVtYmVyIj48L3RoPjx0aD51bmRlZmluZWQ8L3RoPjwvdHI+PC90YWJsZT48L2JvZHk+PC9odG1sPg==';

      dataExporter.downloadData('myFile', 'xls', rawData, downloadOption);

      expect(downloader.execDownload.calls.mostRecent().args[2]).toBe(expected);
    });

    it('should not encoding data to xls.', () => {
      spyOn(downloader, 'execDownload');
      spyOn(dataExporter, '_isNeedDataEncodeing').and.returnValue(false);

      const expected =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ark1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta name=ProgId content=Excel.Sheet><meta charset=UTF-8></head><body><table><tr><th class="number"></th><th>undefined</th></tr></table></body></html>';

      dataExporter.downloadData('myFile', 'xls', rawData, downloadOption);

      expect(downloader.execDownload.calls.mostRecent().args[2]).toBe(expected);
    });
  });
  describe('_makeCsvTextWithRawData()', () => {
    it('should create csv string.', () => {
      expect(
        dataExporter._makeCsvBodyWithRawData([
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ])
      ).toBe('1,2,3\n4,5,6\n7,8,9');
    });

    it('should create csv string with item delimiter.', () => {
      expect(
        dataExporter._makeCsvBodyWithRawData(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          { itemDelimiter: '.' }
        )
      ).toBe('1.2.3\n4.5.6\n7.8.9');
    });

    it('should create csv string with line delimiter.', () => {
      expect(
        dataExporter._makeCsvBodyWithRawData(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          { lineDelimiter: '-' }
        )
      ).toBe('1,2,3-4,5,6-7,8,9');
    });

    it('should create csv string with item and line delimiter.', () => {
      expect(
        dataExporter._makeCsvBodyWithRawData(
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
          ],
          {
            itemDelimiter: '.',
            lineDelimiter: '-'
          }
        )
      ).toBe('1.2.3-4.5.6-7.8.9');
    });
  });

  describe('_makeXlsBodyWithRawData()', () => {
    it('should create xls blob string.', () => {
      const actual = dataExporter._makeXlsBodyWithRawData([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]);
      const tableHTML =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ark1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta name=ProgId content=Excel.Sheet><meta charset=UTF-8></head><body><table><tr><th class="number">1</th><th>2</th><th>3</th></tr><tr><td class="number">4</td><td class="number">5</td><td class="number">6</td></tr><tr><td class="number">7</td><td class="number">8</td><td class="number">9</td></tr></table></body></html>';

      expect(actual).toBe(tableHTML);
    });
  });

  describe('_get2DArrayFromRawData()', () => {
    it('should create 2D array from rawData.', () => {
      const result = [
        ['', 'jan', 'feb'],
        ['john', 10, 20],
        ['jane', 30, 25]
      ];
      expect(
        dataExporter._get2DArrayFromRawData({
          categories: ['jan', 'feb'],
          series: {
            line: [
              {
                name: 'john',
                data: [10, 20]
              },
              {
                name: 'jane',
                data: [30, 25]
              }
            ]
          }
        })
      ).toEqual(result);
    });

    it('even if the data is not an array, it must be a normal concat.', () => {
      const result = [
        ['', 'jan', 'feb'],
        ['john', 10],
        ['jane', 30]
      ];
      expect(
        dataExporter._get2DArrayFromRawData({
          categories: ['jan', 'feb'],
          series: {
            line: [
              {
                name: 'john',
                data: 10
              },
              {
                name: 'jane',
                data: 30
              }
            ]
          }
        })
      ).toEqual(result);
    });
  });

  describe('_makeTHeadForBullet()', () => {
    it('should make table head of 2 cells if it only has data property', () => {
      const actual = dataExporter._makeTHeadForBullet(0, 0);

      expect(actual).toEqual(['', 'Actual']);
    });

    it('should make table head containing 1 range cell and 2 marker cells', () => {
      const actual = dataExporter._makeTHeadForBullet(1, 2);

      expect(actual).toEqual(['', 'Actual', 'Ranges0', 'Markers0', 'Markers1']);
    });
  });

  describe('_makeTCellsFromBulletRanges()', () => {
    let actual, ranges, maxRangeCount;

    it('should return array having length of maxRangeCount', () => {
      maxRangeCount = 0;
      actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

      expect(actual).toEqual([]);
      expect(actual.length).toBe(0);
    });

    it('should not return empty array, if ranges is empty and maxRangeCount is natural number', () => {
      ranges = [];
      maxRangeCount = 3;
      actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

      expect(actual).toEqual(['', '', '']);
      expect(actual.length).toBe(3);
    });

    it('should make range data cells using range array', () => {
      ranges = [
        [-10, 0],
        [0, 10],
        [10, 20]
      ];
      maxRangeCount = 3;
      actual = dataExporter._makeTCellsFromBulletRanges(ranges, maxRangeCount);

      expect(actual).toEqual(['-10~0', '0~10', '10~20']);
    });
  });

  describe('_makeTCellsFromBulletMarkers()', () => {
    let actual, markers, maxMarkerCount;

    it('should return array having length of maxRangeCount', () => {
      maxMarkerCount = 3;
      actual = dataExporter._makeTCellsFromBulletMarkers(markers, maxMarkerCount);

      expect(actual).toEqual(['', '', '']);
      expect(actual.length).toBe(3);
    });

    it('should make marker data cells using marker array', () => {
      markers = [-5, 5];
      maxMarkerCount = 3;
      actual = dataExporter._makeTCellsFromBulletMarkers(markers, maxMarkerCount);

      expect(actual).toEqual([-5, 5, '']);
    });
  });

  describe('_get2DArrayFromBulletRawData()', () => {
    it('should create 2D array from raw data of bullet chart', () => {
      const actual = dataExporter._get2DArrayFromBulletRawData(
        {
          series: {
            bullet: [
              {
                name: 'series0',
                data: 25,
                ranges: [[1, 0]],
                markers: [13, 15]
              },
              {
                name: 'series1',
                data: 13,
                ranges: [
                  [7, 10],
                  [10, 13]
                ],
                markers: [15]
              }
            ]
          }
        },
        {
          maxRangeCount: 2,
          maxMarkerCount: 2
        }
      );

      expect(actual).toEqual([
        ['', 'Actual', 'Ranges0', 'Ranges1', 'Markers0', 'Markers1'],
        ['series0', 25, '1~0', '', 13, 15],
        ['series1', 13, '7~10', '10~13', 15, '']
      ]);
    });
  });

  describe('_get2DArrayFromHeatmapRawData()', () => {
    const result = [
      ['', 'jan', 'feb'],
      ['john', 10, 20],
      ['jane', 30, 25]
    ];
    it('should create 2D array from heatmap rawData.', () => {
      expect(
        dataExporter._get2DArrayFromRawData({
          categories: {
            x: ['jan', 'feb'],
            y: ['john', 'jane']
          },
          series: {
            heatMap: [
              [10, 20],
              [30, 25]
            ]
          }
        })
      ).toEqual(result);
    });
  });
});
