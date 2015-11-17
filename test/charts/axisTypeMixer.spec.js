/**
 * @fileoverview test axisTypeMixer.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var axisTypeMixer = require('../../src/js/charts/axisTypeMixer.js'),
    Tooltip = require('../../src/js/tooltips/tooltip'),
    GroupTooltip = require('../../src/js/tooltips/groupTooltip');

describe('ComboChart', function() {
    var componentMap = {};
    beforeAll(function() {
        axisTypeMixer.addComponent = jasmine.createSpy('addComponent').and.callFake(function(name, ComponentClass) {
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
            expect(componentMap.yrAxis).not.toBeDefined();
        });

        it('yrAxis을 목록에 포함시키면 컴포넌트로 등록됩니다.', function() {
            axisTypeMixer._addAxisComponents(['xAxis', 'yAxis', 'yrAxis'], true);
            expect(componentMap.xAxis).toBeDefined();
            expect(componentMap.yAxis).toBeDefined();
            expect(componentMap.yrAxis).toBeDefined();
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
            axisTypeMixer.addComponentsForAxisType({
                axes: ['xAxis', 'yAxis'],
                convertedData: {},
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

    describe('_makeSeriesDataForRendering()', function() {
        it('가로형(!!isVertical === false) 차트의 시리즈 데이터는 x axis의 scale과 aligned를 반환합니다.', function() {
            var xAxis = {
                    scale: {},
                    aligned: true
                },
                actual;

            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis
            });

            expect(actual.series.scale).toBe(xAxis.scale);
            expect(actual.series.aligned).toBe(xAxis.aligned);
        });

        it('세로형 단일 차트의 시리즈 데이터는 y axis scale과 x axis의 aligned를 반환합니다.', function() {
            var xAxis = {
                    aligned: true
                },
                yAxis = {
                    scale: {}
                },
                actual;

            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis,
                yAxis: yAxis
            }, true);

            expect(actual.series.scale).toBe(yAxis.scale);
            expect(actual.series.aligned).toBe(xAxis.aligned);
        });

        it('세로형 다중 차트의 시리즈 데이터는 option chart type 순서에 따라 chartType + "series" 조합을 key로하는 y axis scale, yr axis scale을 반환합니다.', function() {
            var xAxis = {
                    aligned: true
                },
                yAxis = {
                    scale: {}
                },
                yrAxis = {
                    scale: {}
                },
                actual;

            axisTypeMixer.optionChartTypes = ['column', 'line'];
            actual = axisTypeMixer._makeSeriesDataForRendering({
                xAxis: xAxis,
                yAxis: yAxis,
                yrAxis: yrAxis
            }, true);

            expect(actual.columnSeries.scale).toBe(yAxis.scale);
            expect(actual.columnSeries.aligned).toBe(xAxis.aligned);
            expect(actual.lineSeries.scale).toBe(yrAxis.scale);
            expect(actual.lineSeries.aligned).toBe(xAxis.aligned);
        });
    });

    describe('_makePlotDataForRendering()', function() {
        it('ploat data의 vTickCount는 yAxis.validTickCount를 hTickCount는 yAxis.validTickCount를 갖습니다.', function() {
            var actual = axisTypeMixer._makePlotDataForRendering({
                    yAxis: {
                        validTickCount: 0
                    },
                    xAxis: {
                        validTickCount: 4
                    }
                }),
                expected = {
                    vTickCount: 0,
                    hTickCount: 4
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeEventHandleLayerDataForRendering()', function() {
        it('세로 차트의 경우는 xAxis.tickCount를 tickCount로 반환합니다.', function() {
            var actual = axisTypeMixer._makeEventHandleLayerDataForRendering({
                    xAxis: {
                        tickCount: 5
                    },
                    yAxis: {
                        tickCount: 3
                    }
                }, true),
                expected = {
                    tickCount: 5
                };
            expect(actual).toEqual(expected);
        });

        it('가로 차트의 경우는 yAxis.tickCount를 tickCount로 반환합니다.', function() {
            var actual = axisTypeMixer._makeEventHandleLayerDataForRendering({
                    xAxis: {
                        tickCount: 5
                    },
                    yAxis: {
                        tickCount: 3
                    }
                }, false),
                expected = {
                    tickCount: 3
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_setRenderingData()', function() {
        it('axis type chart의 renderingData를 셋팅합니다.', function() {
            axisTypeMixer._makeAxesData = jasmine.createSpy('_makeAxesData').and.returnValue({
                xAxis: {
                    scale: {},
                    aligned: true,
                    validTickCount: 0
                },
                yAxis: {
                    tickCount: 3,
                    validTickCount: 3
                }
            });
            axisTypeMixer._setRenderingData();
            expect(axisTypeMixer.renderingData.plot.vTickCount).toBe(3);
            expect(axisTypeMixer.renderingData.plot.hTickCount).toBe(0);
            expect(axisTypeMixer.renderingData.eventHandleLayer.tickCount).toBe(3);
            expect(axisTypeMixer.renderingData.series.scale).toBeDefined();
            expect(axisTypeMixer.renderingData.series.aligned).toBe(true);
        });
    });
});
