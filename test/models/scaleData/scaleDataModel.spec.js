/**
 * @fileoverview Test for AxisScaleMaker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ScaleDataModel = require('../../../src/js/models/scaleData/scaleDataModel.js');
var axisDataMaker = require('../../../src/js/models/scaleData/axisDataMaker');

describe('Test for ScaleDataModel', function() {
    var scaleDataModel, dataProcessor, boundsModel;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'hasCategories']);
        boundsModel = jasmine.createSpyObj('boundsModel', ['getDimension']);
        scaleDataModel = new ScaleDataModel({
            dataProcessor: dataProcessor,
            boundsModel: boundsModel,
            options: {}
        });
    });

    describe('_createAxisData()', function() {
        it('if exist scaleData, returns result by executing axisDataMaker.makeValueAxisData', function() {
            var scaleData = {
                limit: {
                    min: 1000,
                    max: 3000
                },
                step: 1000,
                labels: ['1,000', '2,000', '3,000'],
                axisOptions: 'options'
            };
            var actual, expected;

            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
            dataProcessor.hasCategories.and.returnValue(true);

            actual = scaleDataModel._createAxisData(scaleData, 'options', 'labelTheme', true);
            expected = 'value type';

            expect(axisDataMaker.makeValueAxisData).toHaveBeenCalledWith({
                labels: ['1,000', '2,000', '3,000'],
                tickCount: 3,
                limit: {
                    min: 1000,
                    max: 3000
                },
                step: 1000,
                options: 'options',
                labelTheme: 'labelTheme',
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
            scaleDataModel.options.series = {};

            actual = scaleDataModel._createAxisData(null, 'options', 'labelTheme');
            expected = 'label type';

            expect(axisDataMaker.makeLabelAxisData).toHaveBeenCalledWith({
                labels: ['cate1', 'cate2'],
                options: 'options',
                labelTheme: 'labelTheme',
                isVertical: false,
                isPositionRight: false,
                aligned: false,
                addedDataCount: 0
            });
            expect(actual).toBe(expected);
        });
    });

    describe('updateXAxisDataForAutoTickInterval()', function() {
        beforeEach(function() {
            boundsModel.getDimension.and.returnValue({
                width: 200
            });
            scaleDataModel.axisDataMap = {
                xAxis: {}
            };
        });

        it('update xAxisData, when has shifting option', function() {
            scaleDataModel.options.series = {
                shifting: true
            };
            spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');
            scaleDataModel.addedDataCount = 0;

            scaleDataModel.updateXAxisDataForAutoTickInterval({}, false);

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0, false);
        });

        it('update xAxisData, when has not prevUpdatedData', function() {
            scaleDataModel.options.series = {
                shifting: true
            };
            spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');
            scaleDataModel.addedDataCount = 0;

            scaleDataModel.updateXAxisDataForAutoTickInterval({}, false);

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0, false);
        });

        it('update xAxisData, when has not shifting option and has prevUpdatedData', function() {
            var prevXAxisData = 'previous xAxis data';

            scaleDataModel.options.series = {};
            scaleDataModel.firstTickCount = 5;
            spyOn(axisDataMaker, 'updateLabelAxisDataForStackingDynamicData');

            scaleDataModel.updateXAxisDataForAutoTickInterval(prevXAxisData);

            expect(axisDataMaker.updateLabelAxisDataForStackingDynamicData).toHaveBeenCalledWith(
                {}, 'previous xAxis data', 5
            );
        });
    });
});
