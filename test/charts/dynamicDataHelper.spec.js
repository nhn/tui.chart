/**
 * @fileoverview Test for addingDynamicDataMixer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var DynamicDataHelper = require('../../src/js/charts/dynamicDataHelper');
var chartConst = require('../../src/js/const');

describe('Test for DynamicDataHelper', function() {
    var dataProcessor, componentManager, ddh;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getCategoryCount', 'shiftData', 'addDataFromDynamicData',
                'addDataFromRemainDynamicData', 'getValues', 'isCoordinateType']);

        componentManager = jasmine.createSpyObj('componentManager', ['render']);

        ddh = new DynamicDataHelper({
            dataProcessor: dataProcessor,
            componentManager: componentManager,
            options: {
                series: {},
                xAxis: {}
            },
            on: function() {},
            readyForRender: jasmine.createSpy('readyForRender'),
            _renderComponents: jasmine.createSpy('_renderComponents)')
        });
    });

    describe('_calculateAnimateTickSize()', function() {
        it('calculate animate tick size, when is coordinateType chart', function() {
            var xAxisWidth = 300;
            var actual;

            dataProcessor.isCoordinateType.and.returnValue(true);
            dataProcessor.getValues.and.returnValue([10, 20, 30, 40]);
            ddh.chart.chartType = chartConst.CHART_TYPE_LINE;

            actual = ddh._calculateAnimateTickSize(xAxisWidth);

            expect(dataProcessor.getValues).toHaveBeenCalledWith(chartConst.CHART_TYPE_LINE, 'x');
            expect(actual).toBe(100);
        });

        it('if not coordinateType data, get tickCount from dataProcessor.getCategoryCount function', function() {
            var xAxisWidth = 300;
            var actual;

            dataProcessor.isCoordinateType.and.returnValue(false);
            dataProcessor.getCategoryCount.and.returnValue(4);

            actual = ddh._calculateAnimateTickSize(xAxisWidth);

            expect(dataProcessor.getCategoryCount).toHaveBeenCalledWith(false);
            expect(actual).toBe(100);
        });
    });

    describe('_animateForAddingData()', function() {
        beforeEach(function() {
            dataProcessor.getCategoryCount.and.returnValue(5);
            dataProcessor.isCoordinateType.and.returnValue(false);

            ddh.axisDataMap = {
                xAxis: {}
            };
            ddh.dimensionMap = {
                xAxis: {
                    width: 200
                }
            };

            ddh.chart.readyForRender.and.returnValue({
                dimensionMap: ddh.dimensionMap
            });
        });

        it('_animateForAddingData 함수를 호출하면 addesDataCount를 증가시킵니다.', function() {
            expect(ddh.addedDataCount).toBe(0);

            ddh._animateForAddingData();

            expect(ddh.addedDataCount).toBe(1);
        });

        it('_animateForAddingData 함수를 호출하면 readyForRender 함수를 실행합니다.', function() {
            ddh._animateForAddingData();

            expect(ddh.chart.readyForRender).toHaveBeenCalled();
        });

        it('_animateForAddingData 함수를 호출하면 _render함수에 전달하는 콜백함수를 통해 _renderComponents를 실행 해' +
           '각 컴포넌트 animateForAddingData함수를 tickSize와 shifting 옵션 값을 전달하며 실행합니다.', function() {
            var boundsAndScale = {
                dimensionMap: {
                    xAxis: {
                        width: 200
                    }
                }
            };

            ddh.chart.readyForRender.and.callFake(function() {
                return boundsAndScale;
            });

            ddh._animateForAddingData();

            expect(componentManager.render).toHaveBeenCalledWith('animateForAddingData', boundsAndScale, {
                tickSize: 50,
                shifting: false
            });
        });

        it('shifting 옵션이 있으면 dataProcessor.shiftData 함수를 실행합니다.', function() {
            ddh.chart.options.series.shifting = true;
            ddh._animateForAddingData();

            expect(dataProcessor.shiftData).toHaveBeenCalled();
        });
    });

    describe('_rerenderForAddingData()', function() {
        it('_rerenderForAddingData 함수를 호출하면 readyForRender 함수를 실행합니다.', function() {
            ddh._rerenderForAddingData();

            expect(ddh.chart.readyForRender).toHaveBeenCalled();
        });

        it('_rerenderForAddingData 함수를 호출하면 _renderComponents를 실행 해' +
           '각 컴포넌트 rerender함수를 animatable=false 값을 전달하며 실행합니다.', function() {
            var boundsAndScale = {dimensionMap: {
                xAxis: {
                    width: 200
                }
            }};

            ddh.chart.readyForRender.and.callFake(function() {
                return boundsAndScale;
            });

            ddh._rerenderForAddingData();

            expect(componentManager.render).toHaveBeenCalledWith('rerender', boundsAndScale);
        });
    });

    describe('_checkForAddedData()', function() {
        beforeEach(function() {
            var boundsAndScale = {
                dimensionMap: {
                    xAxis: {
                        width: 200
                    }
                }
            };

            ddh.chart.readyForRender.and.callFake(function() {
                return boundsAndScale;
            });
        });
        it('동적데이터가 존재하면 dataProcessor.addDataFromDynamicData를 통해 데이터를 추가하고 _animateForAddingData를 호출합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(ddh, '_animateForAddingData');

            ddh.isInitRenderCompleted = true;
            ddh._checkForAddedData();

            expect(ddh._animateForAddingData).toHaveBeenCalled();
        });

        it('we should not animate for added data if initial render have not completed', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(ddh, '_animateForAddingData');

            ddh.isInitRenderCompleted = false;
            ddh._checkForAddedData();

            expect(ddh._animateForAddingData).toHaveBeenCalled();
        });

        it('동적데이터가 존재하면 0.4초 뒤에 _rerenderForAddingData, _checkForAddedData를 호출합니다. ', function(done) {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(ddh, '_rerenderForAddingData');

            ddh._checkForAddedData();
            setTimeout(function() {
                expect(ddh._rerenderForAddingData).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('동적데이터가 존재하지 않는다면 lookupping을 false로 변경하고 바로 종료 합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(ddh, '_animateForAddingData');

            ddh._checkForAddedData();

            expect(ddh.lookupping).toBe(false);
            expect(ddh._animateForAddingData).not.toHaveBeenCalled();
        });

        it('paused값이 true이면 동적데이터가 존재하더라도 하위의 함수들을 실행하지 않고 바로 종료 합니다.', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(ddh, '_animateForAddingData');
            ddh.paused = true;

            ddh._checkForAddedData();

            expect(ddh._animateForAddingData).not.toHaveBeenCalled();
        });
    });

    describe('pauseAnimation()', function() {
        it('pauseAnimation을 호출하면 paused값이 true로 설정합니다.', function() {
            ddh._initForAutoTickInterval = jasmine.createSpy('_initForAutoTickInterval');

            ddh.paused = false;
            ddh.pauseAnimation();

            expect(ddh.paused).toBe(true);
        });

        it('this.rerenderingDelayTimerId 값이 있으면 clearTimeout을 수행하고 this.delayRerender를 null로 설정합니다.', function() {
            spyOn(window, 'clearTimeout');

            ddh.rerenderingDelayTimerId = 1;
            ddh.pauseAnimation();

            expect(ddh.rerenderingDelayTimerId).toBeNull();
            expect(window.clearTimeout).toHaveBeenCalled();
        });

        it('this.rerenderingDelayTimerId 값이 있으면서 shifting옵션이 ture이면 dataProcessor.shiftData함수를 호출합니다.', function() {
            spyOn(window, 'clearTimeout');

            ddh.chart.options.series.shifting = true;

            ddh.rerenderingDelayTimerId = 1;
            ddh.pauseAnimation();

            expect(dataProcessor.shiftData).toHaveBeenCalled();
        });
    });

    describe('_changeCheckedLegends()', function() {
        beforeEach(function() {
            ddh.pauseAnimation = jasmine.createSpy('pauseAnimation');
            ddh.chart._rerender = jasmine.createSpy('_rerender');
            ddh.restartAnimation = jasmine.createSpy('restartAnimation');
            ddh.chart.rerender = jasmine.createSpy('rerender');
        });

        it('일시정지 상태가 아니라면 _pauseAnimationForAddingData를 호출하여 동적데이터 추가 애니메이션을 일시 정지하고' +
           ' rerender를 실행합니다', function() {
            ddh.changeCheckedLegends();

            expect(ddh.pauseAnimation).toHaveBeenCalled();
            expect(ddh.chart.rerender).toHaveBeenCalled();
        });

        it('일시정지 상태가 아니라면 rerender 후 0.7초 뒤에 _restartAnimationForAddingData를 실행합니다.', function(done) {
            ddh.changeCheckedLegends();

            setTimeout(function() {
                expect(ddh.restartAnimation).toHaveBeenCalled();
                done();
            }, 700);
        });
    });
});
