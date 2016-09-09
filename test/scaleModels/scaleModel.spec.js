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
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'hasCategories']);
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
                axisOptions: 'options',
                getFormattedScaleValues: function() {
                    return ['1,000', '2,000', '3,000'];
                },
                getLimit: function() {
                    return {
                        min: 1000,
                        max: 3000
                    };
                },
                getStep: function() {
                    return 1000;
                }
            };
            var actual, expected;

            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
            dataProcessor.hasCategories.and.returnValue(true);

            actual = scaleModel._createAxisData(scaleData, 'options', 'labelTheme', true);
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
            scaleModel.options.series = {};

            actual = scaleModel._createAxisData(null, 'options', 'labelTheme');
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

            scaleModel.updateXAxisDataForAutoTickInterval(false);

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0, false);
        });

        it('update xAxisData, when has not prevUpdatedData', function() {
            scaleModel.options.series = {
                shifting: true
            };
            spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');

            scaleModel.updateXAxisDataForAutoTickInterval(false);

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalledWith({}, 200, 0, false);
        });

        it('update xAxisData, when has not shifting option and has prevUpdatedData', function() {
            scaleModel.options.series = {};
            scaleModel.prevUpdatedData = 'previous updated data';
            scaleModel.firstTickCount = 5;
            spyOn(axisDataMaker, 'updateLabelAxisDataForStackingDynamicData');

            scaleModel.updateXAxisDataForAutoTickInterval();

            expect(axisDataMaker.updateLabelAxisDataForStackingDynamicData).toHaveBeenCalledWith(
                {}, 'previous updated data', 5
            );
        });
    });
});
