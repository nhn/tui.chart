/**
 * @fileoverview Test for chartExporter.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartExporter = require('../../src/js/helpers/chartExporter');
var imageExporter = require('../../src/js/helpers/imageExporter');
var dataExporter = require('../../src/js/helpers/dataExporter');

describe('Test for chartExporter', function() {
    var rawData = [];
    var downloadOption = {
        xls: {},
        csv: {},
        png: {},
        jpeg: {}
    };
    var canvas = document.createElement('canvas');

    beforeEach(function() {
        spyOn(imageExporter, 'downloadImage');
        spyOn(dataExporter, 'downloadData');
    });
    describe('exportChart()', function() {
        it('should download data when file extension is xls.', function() {
            chartExporter.exportChart('myFile', 'xls', rawData, null, downloadOption);
            expect(dataExporter.downloadData).toHaveBeenCalledWith('myFile', 'xls', rawData, downloadOption.xls);
        });
        it('should download data when file extension is csv.', function() {
            chartExporter.exportChart('myFile', 'csv', rawData, null, downloadOption);
            expect(dataExporter.downloadData).toHaveBeenCalledWith('myFile', 'csv', rawData, downloadOption.csv);
        });
        it('should download image when file extension is png.', function() {
            chartExporter.exportChart('myFile', 'png', rawData, canvas, null);
            expect(imageExporter.downloadImage).toHaveBeenCalledWith('myFile', 'png', canvas);
        });
        it('should download image when file extension is png.', function() {
            chartExporter.exportChart('myFile', 'jpeg', rawData, canvas, null);
            expect(imageExporter.downloadImage).toHaveBeenCalledWith('myFile', 'jpeg', canvas);
        });
        it('should not download file when extension neither image or data.', function() {
            chartExporter.exportChart('myFile', 'exe', rawData, canvas, null);
            expect(imageExporter.downloadImage).not.toHaveBeenCalled();
            expect(dataExporter.downloadData).not.toHaveBeenCalled();
        });
    });
});
