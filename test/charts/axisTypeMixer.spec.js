/**
 * @fileoverview test axisTypeMixer.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisTypeMixer = require('../../src/js/charts/axisTypeMixer.js'),
    Tooltip = require('../../src/js/tooltips/tooltip'),
    GroupTooltip = require('../../src/js/tooltips/groupTooltip'),
    GroupTypeCustomEvent = require('../../src/js/customEvents/groupTypeCustomEvent'),
    PointTypeCustomEvent = require('../../src/js/customEvents/pointTypeCustomEvent');

describe('ComboChart', function() {
    var componentMap = {};
    beforeAll(function() {
        axisTypeMixer._addComponent = jasmine.createSpy('_addComponent').and.callFake(function(name, ComponentClass) {
            componentMap[name] = ComponentClass;
        });
    });

    beforeEach(function() {
        componentMap = {};
    });

    describe('_addAxesComponents', function() {
        it('axis 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer._addAxisComponents(['xAxis', 'yAxis'], true);
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.rightYAxis).not.toBeDefined();
        });

        it('rightYAxis을 목록에 포함시키면 컴포넌트로 등록됩니다.', function() {
            axisTypeMixer._addAxisComponents(['xAxis', 'yAxis', 'rightYAxis'], true);
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.rightYAxis).toBeDefined();
        });
    });

    describe('_addSeriesComponents', function() {
        it('series 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer._addSeriesComponents(
                [
                    {
                        name: 'columnSreies',
                        data: {},
                        SeriesClass: ''
                    }, {
                        name: 'lineSeries',
                        data: {},
                        SeriesClass: ''
                    }
                ], {}
            );
            expect(componentMap.columnSreies).toBeDefined();
            expect(componentMap.lineSeries).toBeDefined();
        });
    });

    describe('_addTooltipComponent', function() {
        it('isGroupedTooltip값이 true이면 그룹 툴팁 컴포넌트를 추가합니다..', function() {
            axisTypeMixer.hasGroupTooltip = true;
            axisTypeMixer._addTooltipComponent({}, {});
            expect(componentMap.tooltip).toEqual(GroupTooltip);
        });

        it('isGroupedTooltip값이 true가 아니면 툴팁 컴포넌트를 추가합니다..', function() {
            axisTypeMixer.hasGroupTooltip = false;
            axisTypeMixer._addTooltipComponent({}, {});
            expect(componentMap.tooltip).toEqual(Tooltip);
        });
    });

    describe('addComponentsForAxisType()', function() {
        it('axis type chart의 컴포넌트들을 추가합니다..', function() {
            axisTypeMixer.options = {};
            axisTypeMixer._addComponentsForAxisType({
                axes: ['xAxis', 'yAxis'],
                processedData: {},
                serieses: [
                    {
                        name: 'columnSreies',
                        data: {},
                        SeriesClass: ''
                    }, {
                        name: 'lineSeries',
                        data: {},
                        SeriesClass: ''
                    }
                ]
            });

            expect(componentMap.plot).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.legend).toBeDefined();
            expect(componentMap.columnSreies).toBeDefined();
            expect(componentMap.lineSeries).toBeDefined();
            expect(componentMap.tooltip).toEqual(Tooltip);
        });
    });

    describe('_getLimitMap()', function() {
        it('가로형 차트에서는 xAxis의 limit 정보를 chart type을 키로하여 반환합니다.', function() {
            var xAxis = {
                    limit: {}
                },
                yAxis = {
                    limit: {}
                },
                actual = axisTypeMixer._getLimitMap({
                    xAxis: xAxis,
                    yAxis: yAxis
                }, ['bar'], false);
            expect(actual.bar).toBe(xAxis.limit);
        });

        it('세로형 차트에서는 yAxis의 limit 정보를 chart type을 키로하여 반환합니다.', function() {
            var xAxis = {
                    limit: {}
                },
                yAxis = {
                    limit: {}
                },
                actual = axisTypeMixer._getLimitMap({
                    xAxis: xAxis,
                    yAxis: yAxis
                }, ['column'], true);
            expect(actual.column).toBe(yAxis.limit);
        });

        it('chart type이 두가지인(콤보차트) 세로형 차트에서는 마지막에 오는 chartType을 키로 rightYAxis의 limit 정보를 포함하는 데이터도 포함됩니다.', function() {
            var xAxis = {
                    limit: {}
                },
                yAxis = {
                    limit: {}
                },
                rightYAxis = {
                    limit: {}
                },
                actual = axisTypeMixer._getLimitMap({
                    xAxis: xAxis,
                    yAxis: yAxis,
                    rightYAxis: rightYAxis
                }, ['column', 'line'], true);
            expect(actual.column).toBe(yAxis.limit);
            expect(actual.line).toBe(rightYAxis.limit);
        });
    });

    describe('_makeSeriesDataForRendering()', function() {
        it('가로형(!!isVertical === false) 차트의 시리즈 데이터는 x axis의 limit과 aligned를 반환합니다.', function() {
            var xAxis = {
                    limit: {},
                    aligned: true
                },
                yAxis = {
                    limit: {}
                },
                actual;

            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis,
                yAxis: yAxis
            }, ['bar'], false);

            expect(actual.series.limit).toBe(xAxis.limit);
            expect(actual.series.aligned).toBe(xAxis.aligned);
        });

        it('세로형 단일 차트의 시리즈 데이터는 y axis limit과 x axis의 aligned를 반환합니다.', function() {
            var xAxis = {
                    aligned: true
                },
                yAxis = {
                    limit: {}
                },
                actual;

            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis,
                yAxis: yAxis
            }, ['column'], true);

            expect(actual.series.limit).toBe(yAxis.limit);
            expect(actual.series.aligned).toBe(xAxis.aligned);
        });

        it('세로형 다중 차트의 시리즈 데이터는 option chart type 순서에 따라 chartType + "series" 조합을 key로하는 y axis limit, yr axis limit을 반환합니다.', function() {
            var xAxis = {
                    aligned: true
                },
                yAxis = {
                    limit: {}
                },
                rightYAxis = {
                    limit: {}
                },
                actual;

            axisTypeMixer.optionChartTypes = ['column', 'line'];
            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis,
                yAxis: yAxis,
                rightYAxis: rightYAxis
            }, ['column', 'line'], true);

            expect(actual.columnSeries.limit).toBe(yAxis.limit);
            expect(actual.columnSeries.aligned).toBe(xAxis.aligned);
            expect(actual.lineSeries.limit).toBe(rightYAxis.limit);
            expect(actual.lineSeries.aligned).toBe(xAxis.aligned);
        });
    });

    describe('_makeRenderingData()', function() {
        it('axis type chart의 renderingData를 생성합니다.', function() {
            var actual;
            axisTypeMixer._makeAxesData = jasmine.createSpy('_makeAxesData').and.returnValue({
                xAxis: {
                    limit: {},
                    aligned: true,
                    validTickCount: 0
                },
                yAxis: {
                    tickCount: 3,
                    validTickCount: 3
                }
            });
            actual = axisTypeMixer._makeRenderingData({
                chart: {}
            });
            expect(actual.plot.vTickCount).toBe(3);
            expect(actual.plot.hTickCount).toBe(0);
            expect(actual.customEvent.tickCount).toBe(3);
            expect(actual.series.limit).toBeDefined();
            expect(actual.series.aligned).toBe(true);
        });
    });

    describe('_addCustomEventComponentForGroupTooltip()', function() {
        it('그룹 툴팁을 위한 custom event 컴포넌트는 GroupTypeCustomEvent 클래스로 생성합니다.', function() {
            axisTypeMixer._addCustomEventComponentForGroupTooltip();
            expect(componentMap.customEvent).toBe(GroupTypeCustomEvent);
        });
    });

    describe('_addCustomEventComponentForNormalTooltip()', function() {
        it('일반 툴팁을 위한 custom event 컴포넌트는 PointTypeCustomEvent 클래스로 생성합니다.', function() {
            axisTypeMixer._addCustomEventComponentForNormalTooltip();
            expect(componentMap.customEvent).toBe(PointTypeCustomEvent);
        });
    });
});
