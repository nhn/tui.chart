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

        it('should increase addesDataCount', function() {
            expect(ddh.addedDataCount).toBe(0);

            ddh._animateForAddingData();

            expect(ddh.addedDataCount).toBe(1);
        });

        it('should call readyForRender()', function() {
            ddh._animateForAddingData();

            expect(ddh.chart.readyForRender).toHaveBeenCalled();
        });

        it('should call animateForAddingData() with tickSize and shifting option for each component', function() {
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

        it('should call dataProcessor.shiftData(), when there is shifting option', function() {
            ddh.chart.options.series.shifting = true;
            ddh._animateForAddingData();

            expect(dataProcessor.shiftData).toHaveBeenCalled();
        });
    });

    describe('_rerenderForAddingData()', function() {
        it('should call readyForRender()', function() {
            ddh._rerenderForAddingData();

            expect(ddh.chart.readyForRender).toHaveBeenCalled();
        });

        it('should call rerender() with animatable of false value', function() {
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
        it('should append dynamic data when some dynamic data added, and then call _animateForAddingData()', function() {
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

        it('should call _rerenderForAddingData, _checkForAddedData 0.4 sec after dynamic data detection', function(done) {
            dataProcessor.addDataFromDynamicData.and.returnValue(true);
            spyOn(ddh, '_rerenderForAddingData');

            ddh._checkForAddedData();
            setTimeout(function() {
                expect(ddh._rerenderForAddingData).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('should quit lookupping and appending data, when there is no dynamic data', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(ddh, '_animateForAddingData');

            ddh._checkForAddedData();

            expect(ddh.lookupping).toBe(false);
            expect(ddh._animateForAddingData).not.toHaveBeenCalled();
        });

        it('should not append data even thought it has dynamic data, when paused is true', function() {
            dataProcessor.addDataFromDynamicData.and.returnValue(false);
            spyOn(ddh, '_animateForAddingData');
            ddh.paused = true;

            ddh._checkForAddedData();

            expect(ddh._animateForAddingData).not.toHaveBeenCalled();
        });
    });

    describe('pauseAnimation()', function() {
        it('should set paused true', function() {
            ddh._initForAutoTickInterval = jasmine.createSpy('_initForAutoTickInterval');

            ddh.paused = false;
            ddh.pauseAnimation();

            expect(ddh.paused).toBe(true);
        });

        it('should stop timer, when there is this.rerenderingDelayTimerId value.', function() {
            spyOn(window, 'clearTimeout');

            ddh.rerenderingDelayTimerId = 1;
            ddh.pauseAnimation();

            expect(ddh.rerenderingDelayTimerId).toBeNull();
            expect(window.clearTimeout).toHaveBeenCalled();
        });

        it('should shift data, when shifting option is true and rerendering is on', function() {
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

        it('should stop adding data animation and rerender graph, if it is not paused', function() {
            ddh.changeCheckedLegends();

            expect(ddh.pauseAnimation).toHaveBeenCalled();
            expect(ddh.chart.rerender).toHaveBeenCalled();
        });

        it('should restart andding data animation after 0.7s, if it is not paused', function(done) {
            ddh.changeCheckedLegends();

            setTimeout(function() {
                expect(ddh.restartAnimation).toHaveBeenCalled();
                done();
            }, 700);
        });
    });
});
