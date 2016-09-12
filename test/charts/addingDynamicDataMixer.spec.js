/**
 * @fileoverview Test for addingDynamicDataMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var mixer = require('../../src/js/charts/addingDynamicDataMixer');

describe('Test for addingDynamicDataMixer', function() {
    var dataProcessor, boundsMaker, scaleModel;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
                    ['getCategoryCount', 'shiftData', 'addDataFromDynamicData', 'getValues', 'isCoordinateType']);
        boundsMaker = jasmine.createSpyObj('boundsMaker',
                                ['initBoundsData', 'getAxesData', 'getDimension', 'onAddingDataMode', 'offAddingDataMode']);
        scaleModel = jasmine.createSpyObj('scaleModel', ['initScaleData', 'initForAutoTickInterval'])

        mixer.dataProcessor = dataProcessor;
        mixer.boundsMaker = boundsMaker;
        mixer.scaleModel = scaleModel;

        mixer._initForAddingData();
        mixer.options = {
            series: {},
            xAxis: {}
        };

        mixer._render = jasmine.createSpy('_render').and.callFake(function(callback) {
            callback({});
        });
        mixer._renderComponents = jasmine.createSpy('_renderComponents');
    });

    describe('_animateForAddingData()', function() {
        beforeEach(function() {
            dataProcessor.getCategoryCount.and.returnValue(5);
            dataProcessor.isCoordinateType.and.returnValue(false);
            boundsMaker.getAxesData.and.returnValue({
                xAxis: {}
            });
            boundsMaker.getDimension.and.returnValue({
                width: 200
            });
        });

        it('_animateForAddingData 함수를 호출하면 addesDataCount를 증가시킵니다.', function() {
            expect(mixer.addedDataCount).toBe(0);

            mixer._animateForAddingData();

            expect(mixer.addedDataCount).toBe(1);
        });

        it('_animateForAddingData 함수를 호출하면 _render 함수를 실행합니다.', function() {
            mixer._animateForAddingData();

            expect(mixer._render).toHaveBeenCalled();
        });

        it('if coordinateType data, get tickCount from dataProcessor.getValue function', function() {
            dataProcessor.isCoordinateType.and.returnValue(true);
            dataProcessor.getValues.and.returnValue(10);
            mixer.chartType = 'line';

            mixer._animateForAddingData();

            expect(dataProcessor.getValues).toHaveBeenCalledWith('line', 'x');
        });

        it('if not coordinateType data, get tickCount from dataProcessor.getCategoryCount function', function() {
            dataProcessor.isCoordinateType.and.returnValue(false);

            mixer._animateForAddingData();

            expect(dataProcessor.getCategoryCount).toHaveBeenCalledWith(false);
        });

        it('_animateForAddingData 함수를 호출하면 _render함수에 전달하는 콜백함수를 통해 _renderComponents를 실행 해' +
            '각 컴포넌트 animateForAddingData함수를 tickSize와 shifting 옵션 값을 전달하며 실행합니다.', function() {
            mixer._animateForAddingData();

            expect(mixer._renderComponents).toHaveBeenCalledWith({
                tickSize: 50,
                shifting: false
            }, 'animateForAddingData');
        });

        it('shifting 옵션이 있으면 dataProcessor.shiftData 함수를 실행합니다.', function() {
            mixer.options.series = {
                shifting: true
            };
            mixer._animateForAddingData();

            expect(dataProcessor.shiftData).toHaveBeenCalled();
        });
    });

    describe('_rerenderForAddingData()', function() {
        it('_rerenderForAddingData 함수를 호출하면 _render 함수를 실행합니다.', function() {
            mixer._rerenderForAddingData();

            expect(mixer._render).toHaveBeenCalled();
        });

        it('_rerenderForAddingData 함수를 호출하면 _render함수에 전달하는 콜백함수를 통해 _renderComponents를 실행 해' +
            '각 컴포넌트 rerender함수를 animatable=false 값을 전달하며 실행합니다.', function() {
            mixer._rerenderForAddingData();

            expect(mixer._renderComponents).toHaveBeenCalledWith({
                animatable: false
            }, 'rerender');
        });
    });

    describe('_checkForAddedData()', function() {
        it('동적데이터가 존재하면 dataProcessor.addDataFromDynamicData를 통해 데이터를 추가하고 _animateForAddingData를 호출합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(mixer, '_animateForAddingData');

            mixer._checkForAddedData();

            expect(mixer._animateForAddingData).toHaveBeenCalled();
        });

        it('동적데이터가 존재하면 0.4초 뒤에 _rerenderForAddingData, _checkForAddedData를 호출합니다. ', function(done) {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(mixer, '_animateForAddingData');
            spyOn(mixer, '_rerenderForAddingData');
            spyOn(mixer, '_checkForAddedData');

            mixer._checkForAddedData();

            setTimeout(function() {
                expect(mixer._rerenderForAddingData).toHaveBeenCalledWith();
                expect(mixer._checkForAddedData).toHaveBeenCalled();
                done();
            }, 400);
        });

        it('동적데이터가 존재하지 않는다면 lookupping을 false로 변경하고 바로 종료 합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(mixer, '_animateForAddingData');

            mixer._checkForAddedData();

            expect(mixer.lookupping).toBe(false);
            expect(mixer._animateForAddingData).not.toHaveBeenCalled();
        });

        it('paused값이 true이면 동적데이터가 존재하더라도 하위의 함수들을 실행하지 않고 바로 종료 합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(mixer, '_animateForAddingData');
            mixer.paused = true;

            mixer._checkForAddedData();

            expect(mixer._animateForAddingData).not.toHaveBeenCalled();
        });
    });

    describe('_pauseAnimationForAddingData()', function() {
        it('_pauseAnimationForAddingData함수를 호출하면 paused값이 true로 설정하고 scaleModel.initForAutoTickInterval함수를 실행합니다.', function() {
            mixer._initForAutoTickInterval = jasmine.createSpy('_initForAutoTickInterval');

            mixer.paused = false;
            mixer._pauseAnimationForAddingData();

            expect(mixer.paused).toBe(true);
            expect(scaleModel.initForAutoTickInterval).toHaveBeenCalled();
        });

        it('this.rerenderingDelayTimerId 값이 있으면 clearTimeout을 수행하고 this.delayRerender를 null로 설정합니다.', function() {
            spyOn(window, 'clearTimeout');

            mixer.rerenderingDelayTimerId = 1;
            mixer._pauseAnimationForAddingData();

            expect(mixer.rerenderingDelayTimerId).toBeNull();
            expect(window.clearTimeout).toHaveBeenCalled();
        });

        it('this.rerenderingDelayTimerId 값이 있으면서 shifting옵션이 ture이면 dataProcessor.shiftData함수를 호출합니다.', function() {
            spyOn(window, 'clearTimeout');

            mixer.options.series = {
                shifting: true
            };
            mixer.rerenderingDelayTimerId = 1;
            mixer._pauseAnimationForAddingData();

            expect(dataProcessor.shiftData).toHaveBeenCalled();
        });
    });

    describe('_changeCheckedLegends()', function() {
        beforeAll(function() {
            mixer._pauseAnimationForAddingData = jasmine.createSpy('_pauseAnimationForAddingData');
            mixer._rerender = jasmine.createSpy('_rerender');
            mixer._restartAnimationForAddingData = jasmine.createSpy('_restartAnimationForAddingData');
        });

        it('일시정지 상태가 아니라면 _pauseAnimationForAddingData를 호출하여 동적데이터 추가 애니메이션을 일시 정지하고' +
            ' rerender를 실행합니다', function() {
            mixer._changeCheckedLegends();

            expect(mixer._pauseAnimationForAddingData).toHaveBeenCalled();
            expect(mixer._rerender).toHaveBeenCalled();
        });

        it('일시정지 상태가 아니라면 rerender 후 0.7초 뒤에 _restartAnimationForAddingData를 실행합니다.', function(done) {
            mixer._changeCheckedLegends();

            setTimeout(function() {
                expect(mixer._restartAnimationForAddingData).toHaveBeenCalled();
                done();
            }, 700);
        });
    });
});
