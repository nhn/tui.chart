/**
 * @fileoverview Test for chartExporter.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartExporter from '../../src/js/helpers/chartExporter';
import imageExporter from '../../src/js/helpers/imageExporter';
import dataExporter from '../../src/js/helpers/dataExporter';

describe('Test for chartExporter', () => {
  const rawData = [];
  const downloadOption = {
    xls: {},
    csv: {},
    png: {},
    jpeg: {}
  };
  const canvas = document.createElement('canvas');

  beforeEach(() => {
    spyOn(imageExporter, 'downloadImage');
    spyOn(dataExporter, 'downloadData');
  });
  describe('exportChart()', () => {
    it('should download data when file extension is xls.', () => {
      chartExporter.exportChart('myFile', 'xls', rawData, null, downloadOption);
      expect(dataExporter.downloadData).toHaveBeenCalledWith(
        'myFile',
        'xls',
        rawData,
        downloadOption.xls
      );
    });
    it('should download data when file extension is csv.', () => {
      chartExporter.exportChart('myFile', 'csv', rawData, null, downloadOption);
      expect(dataExporter.downloadData).toHaveBeenCalledWith(
        'myFile',
        'csv',
        rawData,
        downloadOption.csv
      );
    });
    it('should download image when file extension is png.', () => {
      chartExporter.exportChart('myFile', 'png', rawData, canvas, null);
      expect(imageExporter.downloadImage).toHaveBeenCalledWith('myFile', 'png', canvas);
    });
    it('should download image when file extension is png.', () => {
      chartExporter.exportChart('myFile', 'jpeg', rawData, canvas, null);
      expect(imageExporter.downloadImage).toHaveBeenCalledWith('myFile', 'jpeg', canvas);
    });
    it('should not download file when extension neither image or data.', () => {
      chartExporter.exportChart('myFile', 'exe', rawData, canvas, null);
      expect(imageExporter.downloadImage).not.toHaveBeenCalled();
      expect(dataExporter.downloadData).not.toHaveBeenCalled();
    });
  });
});
