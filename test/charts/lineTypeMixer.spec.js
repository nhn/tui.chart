/**
 * @fileoverview Test for lineTypeMixer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var mixer = require('../../src/js/charts/lineTypeMixer');
var axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('Test for lineTypeMixer', function() {
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

    describe('onChangeCheckedLegends()', function() {
        beforeAll(function() {
            mixer._pauseAnimationForAddingData = jasmine.createSpy('_pauseAnimationForAddingData');
            mixer._rerender = jasmine.createSpy('_rerender');
            mixer._restartAnimationForAddingData = jasmine.createSpy('_restartAnimationForAddingData');
        });

        it('일시정지 상태가 아니라면 _pauseAnimationForAddingData를 호출하여 동적데이터 추가 애니메이션을 일시 정지하고' +
            ' rerender를 실행합니다', function() {
            mixer.onChangeCheckedLegends();

            expect(mixer._pauseAnimationForAddingData).toHaveBeenCalled();
            expect(mixer._rerender).toHaveBeenCalled();
        });

        it('일시정지 상태가 아니라면 rerender 후 0.7초 뒤에 _restartAnimationForAddingData를 실행합니다.', function(done) {
            mixer.onChangeCheckedLegends();

            setTimeout(function() {
                expect(mixer._restartAnimationForAddingData).toHaveBeenCalled();
                done();
            }, 700);
        });
    });
});
