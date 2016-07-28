/**
 * @fileoverview Test for autoTickMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var mixer = require('../../src/js/charts/autoTickMixer');
var axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('Test for autoTickMixer', function() {
    var boundsMaker;
    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getAxesData', 'getDimension', 'registerAxesData']);

        spyOn(axisDataMaker, 'updateLabelAxisDataForAutoTickInterval');
        spyOn(axisDataMaker, 'updateLabelAxisDataForStackingDynamicData');

        mixer.boundsMaker = boundsMaker;
    });

    beforeEach(function() {
        mixer.options = {};
    });

    describe('_updateAxesData()', function() {
        beforeAll(function() {
            boundsMaker.getDimension.and.returnValue({
                width: 200
            });
            boundsMaker.getAxesData.and.returnValue({
                xAxis: {}
            });
        });

        it('shifting옵션이 true면 axisDataMaker.updateLabelAxisDataForAutoTickInterval를 수행하여' +
            ' xAxisData를 갱신합니다.', function() {
            mixer.options.series = {
                shifting: true
            };

            mixer._updateAxesData();

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalled();
            expect(boundsMaker.registerAxesData).toHaveBeenCalled();
        });

        it('shifting옵션이 없어도 이전에 갱신된 자동 조정 axisData가 없으면' +
            ' axisDataMaker.updateLabelAxisDataForAutoTickInterval를 수행하여 xAxisData를 갱신합니다.', function() {
            mixer._updateAxesData();

            expect(axisDataMaker.updateLabelAxisDataForAutoTickInterval).toHaveBeenCalled();
            expect(boundsMaker.registerAxesData).toHaveBeenCalled();
        });

        it('shifting옵션이 없으면서 이전에 갱신된 자동 조정 axisData가 있으면' +
            ' axisDataMaker.updateLabelAxisDataForStackingDynamicData 수행하여 xAxisData를 갱신합니다.', function() {
            mixer.prevUpdatedData = {};

            mixer._updateAxesData();

            expect(axisDataMaker.updateLabelAxisDataForStackingDynamicData).toHaveBeenCalled();
            expect(boundsMaker.registerAxesData).toHaveBeenCalled();
        });
    });
});
