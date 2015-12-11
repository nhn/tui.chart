/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase'),
    Plot = require('../../src/js/plots/plot'),
    dom = require('../../src/js/helpers/domHandler'),
    dataProcessor = require('../../src/js/helpers/dataProcessor'),
    boundsMaker = require('../../src/js/helpers/boundsMaker');

describe('ChartBase', function() {
    var chartBase;

    beforeEach(function() {
        chartBase = new ChartBase({
            rawData: {
                categories: ['cate1', 'cate2', 'cate3'],
                series: [
                    {
                        name: 'Legend1',
                        data: [20, 30, 50]
                    },
                    {
                        name: 'Legend2',
                        data: [40, 40, 60]
                    },
                    {
                        name: 'Legend3',
                        data: [60, 50, 10]
                    },
                    {
                        name: 'Legend4',
                        data: [80, 10, 70]
                    }
                ]
            },
            theme: {
                title: {
                    fontSize: 14
                }
            },
            options: {
                chart: {
                    title: 'Chart Title'
                }
            }
        });
    });

    describe('_makeProcessedData()', function() {
        it('전달되 사용자 데이터를 이용하여 차트에서 사용이 용이한 변환 데이터를 생성합니다.', function() {
            var actual;
            spyOn(dataProcessor, 'process').and.returnValue({'values': [1, 2, 3]});
            actual = chartBase._makeProcessedData({
                rawData: {},
                options: {}
            });
            expect(actual.values).toEqual([1, 2, 3]);
        });
    });

    describe('_filterRawData()', function() {
        it('한가지 종류의 series data를 checkedLegends에 값을 갖고 있는 index로 필터링합니다.', function() {
            var actual = chartBase._filterRawData({
                    series: ['a', 'b', 'c', 'd']
                }, [null, true, true]),
                expected = ['b', 'c'];
            expect(actual.series).toEqual(expected);
        });

        it('두가지 종류의 series data를 checkedLegends에 값을 갖고 있는 index로 필터링합니다.', function() {
            var actual = chartBase._filterRawData({
                    series: {
                        column: ['a', 'b', 'c', 'd'],
                        line: ['e', 'f', 'g']
                    }
                }, {
                    column: [null, true, null, true],
                    line: [true]
                }),
                expected = {
                    column: ['b', 'd'],
                    line: ['e']
                };
            expect(actual.series).toEqual(expected);
        });
    });

    describe('_makeRerenderingData()', function() {
        it('전달받은 rendering data에 rerendering에 필요한 data를 생성하여 추가합니다.', function() {
            var processedData = {
                    values: [1, 2, 3],
                    labels: ['lable1', 'label2', 'label3']
                },
                renderingData = {
                    series: {
                        bound: 'seriesBound'
                    },
                    tooltip: {
                        bound: 'tooltipBound'
                    }
                },
                chartTypesMap = {},
                checkedLegends = [true],
                actual;

            chartBase.componentMap = {
               'series': {
                   componentType: 'series',
                   chartType: 'column'
               }
            };

            actual = chartBase._makeRerenderingData(processedData, renderingData, chartTypesMap, checkedLegends);

            expect(actual.tooltip.labels).toEqual(['lable1', 'label2', 'label3']);
            expect(actual.tooltip.bound).toEqual('tooltipBound');
            expect(actual.series.values).toEqual([1, 2, 3]);
            expect(actual.series.bound).toEqual('seriesBound');
        });
    });

    describe('addComponent()', function() {
        it('legend component를 추가 후, 정상 추가 되었는지 확인합니다.', function () {
            var plot;
            chartBase._addComponent('plot', Plot, {});

            plot = chartBase.componentMap.plot;
            expect(plot).toBeTruthy();
            expect(plot.constructor).toEqual(Plot);
            expect(tui.util.inArray('plot', tui.util.pluck(chartBase.components, 'name'))).toBe(0);
        });

        it('추가되지 않은 plot의 경우는 componentMap에 존재하지 않습니다', function () {
            expect(chartBase.componentMap.plot).toBeFalsy();
        });
    });


    describe('_makeBounds()', function() {
        it('차트의 요소들의 bounds 정보를 생성합니다.', function() {
            var actual;
            spyOn(boundsMaker, 'make').and.returnValue({'chart': {dimension: {width: 100, height: 100}}});
            actual = chartBase._makeBounds({});
            expect(actual.chart.dimension).toEqual({width: 100, height: 100});
        });
    });

    describe('_renderTitle()', function() {
        it('글꼴크기가 14px이고 타이틀이 "Chart Title"인 차트 타이틀을 렌더링 합니다.', function () {
            var el = dom.create('DIV');
            chartBase._renderTitle(el);
            expect(el.firstChild.innerHTML).toBe('Chart Title');
            expect(el.firstChild.style.fontSize).toBe('14px');
        });
    });

    describe('_updateDimension()', function() {
        it('전달받은 디멘션 정보로 차트 너비, 높이 정보를 갱신합니다.', function() {
            chartBase.options = {
                chart: {}
            };
            chartBase._updateDimension({
                width: 200,
                height: 100
            });
            expect(chartBase.options.chart.width).toBe(200);
            expect(chartBase.options.chart.height).toBe(100);
        });
    });
});
