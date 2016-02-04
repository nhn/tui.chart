/**
 * @fileoverview test ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase'),
    dom = require('../../src/js/helpers/domHandler'),
    DataProcessor = require('../../src/js/helpers/dataProcessor');

describe('ChartBase', function() {
    var chartBase, componentManager;

    beforeAll(function() {
        componentManager = jasmine.createSpyObj('componentManager', ['where']);
    });

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
        chartBase.componentManager = componentManager;
    });

    describe('_makeProcessedData()', function() {
        it('전달되 사용자 데이터를 이용하여 차트에서 사용이 용이한 변환 데이터를 생성합니다.', function() {
            var actual;
            spyOn(DataProcessor.prototype, 'process').and.returnValue();
            actual = chartBase._createDataProcessor(DataProcessor, {
                rawData: {
                    categories: ['a', 'b', 'c']
                },
                options: {}
            });
            expect(actual instanceof DataProcessor).toBe(true);
            expect(actual.orgRawData).toEqual({
                categories: ['a', 'b', 'c']
            });
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
            var renderingData = {},
                checkedLegends = [true],
                actual;

            componentManager.where.and.returnValue([
                {
                    name: 'columnSeries',
                    chartType: 'column'
                }
            ]);

            actual = chartBase._makeRerenderingData(renderingData, checkedLegends);

            expect(actual.tooltip.checkedLegends).toEqual([true]);
            expect(actual.columnSeries.checkedLegends).toEqual([true]);
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
