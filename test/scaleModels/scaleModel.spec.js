/**
 * @fileoverview Test for AxisScaleMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ScaleModel = require('../../src/js/scaleModels/scaleModel.js');
var axisDataMaker = require('../../src/js/scaleModels/axisDataMaker');

describe('Test for ScaleModel', function() {
    var scaleModel, dataProcessor, boundsMaker;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
        scaleModel = new ScaleModel({
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker,
            options: {}
        });
    });

    describe('_createAxisData()', function() {
        it('if exist scaleData, returns result by executing axisDataMaker.makeValueAxisData', function() {
            var scaleData = {
                axisOptions: 'options'
            };
            var actual, expected;

            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
            scaleModel.chartType = 'bar';

            actual = scaleModel._createAxisData(scaleData, 'options', true);
            expected = 'value type';

            expect(axisDataMaker.makeValueAxisData).toHaveBeenCalledWith({
                axisScaleMaker: scaleData,
                chartType: 'bar',
                dataProcessor: dataProcessor,
                options: 'options',
                isVertical: true,
                isPositionRight: false,
                aligned: false
            });
            expect(actual).toBe(expected);
        });

        it('if not exist scaleData, returns result by executing axisDataMaker.makeLabelAxisData', function() {
            var actual, expected;

            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2']);
            scaleModel.options.series = {};

            actual = scaleModel._createAxisData(null, 'options');
            expected = 'label type';

            expect(axisDataMaker.makeLabelAxisData).toHaveBeenCalledWith({
                labels: ['cate1', 'cate2'],
                options: 'options',
                isVertical: false,
                isPositionRight: false,
                aligned: false,
                addedDataCount: 0
            });
            expect(actual).toBe(expected);
        });
    });

    describe('updateXAxisData()', function() {
        beforeEach(function() {
            boundsMaker.getDimension.and.returnValue({
                width: 200
            });
            scaleModel.axisDataMap = {
                xAxis: {}
            };
        });

        it('update xAxisData, when has shifting option', function() {
            scaleModel.options.series = {
                shifting: true
            };
            spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');

            scaleModel.updateXAxisData();

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0);
        });

        it('update xAxisData, when has not prevUpdatedData', function() {
            scaleModel.options.series = {
                shifting: true
            };
            spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');

            scaleModel.updateXAxisData();

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0);
        });

        it('update xAxisData, when has not shifting option and has prevUpdatedData', function() {
            scaleModel.options.series = {};
            scaleModel.prevUpdatedData = 'previous updated data';
            scaleModel.firstTickCount = 5;
            spyOn(axisDataMaker, 'updateLabelAxisDataForStackingDynamicData');

            scaleModel.updateXAxisData();

            expect(axisDataMaker.updateLabelAxisDataForStackingDynamicData).toHaveBeenCalledWith(
                {}, 'previous updated data', 5
            );
        });
    });

    describe('_createMultilineLabel()', function() {
        it('create multiline labels, when label width shorter than limitWidth', function() {
            var actual = scaleModel._createMultilineLabel('ABCDE FGHIJK', 100, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDE FGHIJK');
        });

        it('create multiline labels, when label width longer than limitWidth', function() {
            var actual = scaleModel._createMultilineLabel('ABCDE FGHIJK HIJKLMN', 40, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDE<br>FGHIJK<br>HIJKLMN');
        });

        it('create multiline labels, when has not empty char)', function() {
            var actual = scaleModel._createMultilineLabel('ABCDEFGHIJKHIJKLMN', 40, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toBe('ABCDEFGHIJKHIJKLMN');
        });
    });

    describe('getMultilineXAxisLabels()', function() {
        it('get multiline labels for x axis by creating labels', function() {
            var actual;

            scaleModel.axisDataMap = {
                xAxis: {
                    labels: ['ABCDEF GHIJ', 'AAAAA', 'BBBBBBBBBBBB']
                }
            };

            actual = scaleModel.getMultilineXAxisLabels(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toEqual(['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB']);
        });

        it('get multiline labels for x axis, when chached labels', function() {
            var actual;

            scaleModel.multilineXAxisLabels = ['ABCDEF<br>GHIJ', 'AAAAA', 'BBBBBBBBBBBB'];

            actual = scaleModel.getMultilineXAxisLabels(50, {
                fontSize: 12,
                fontFamily: 'Verdana'
            });

            expect(actual).toEqual(scaleModel.multilineXAxisLabels);
        });
    });
});
