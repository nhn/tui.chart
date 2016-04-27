/**
 * @fileoverview Test for ChartBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('../../src/js/charts/chartBase'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil'),
    DataProcessor = require('../../src/js/dataModels/dataProcessor');

describe('Test for ChartBase', function() {
    var chartBase, componentManager, boundsMaker;

    beforeAll(function() {
        componentManager = jasmine.createSpyObj('componentManager', ['where']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['initBoundsData']);
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
        chartBase.boundsMaker = boundsMaker;
    });

    describe('_makeProcessedData()', function() {
        it('전달된 사용자 데이터를 이용하여 차트에서 사용이 용이한 변환 데이터를 생성합니다.', function() {
            var actual;
            actual = chartBase._createDataProcessor(DataProcessor, {
                rawData: {
                    categories: ['a', 'b', 'c']
                },
                options: {}
            });
            expect(actual instanceof DataProcessor).toBe(true);
            expect(actual.originalRawData).toEqual({
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
                    componentName: 'columnSeries',
                    chartType: 'column'
                }
            ]);

            actual = chartBase._makeRerenderingData(renderingData, checkedLegends);

            expect(actual.tooltip.checkedLegends).toEqual([true]);
            expect(actual.columnSeries.checkedLegends).toEqual([true]);
        });
    });

    describe('_renderTitle()', function() {
        it('글꼴크기가 14px이고 타이틀이 "Chart Title"인 차트 타이틀을 렌더링 합니다.', function() {
            var el = dom.create('DIV');
            chartBase._renderTitle(el);
            expect(el.firstChild.innerHTML).toBe('Chart Title');
            expect(el.firstChild.style.fontSize).toBe('14px');
        });
    });

    describe('_updateChartDimension()', function() {
        it('전달받은 디멘션 정보로 차트 너비, 높이 정보를 갱신합니다.', function() {
            chartBase.options = {
                chart: {}
            };
            chartBase._updateChartDimension({
                width: 200,
                height: 100
            });
            expect(chartBase.options.chart.width).toBe(200);
            expect(chartBase.options.chart.height).toBe(100);
        });
    });

    describe('resize()', function() {
        it('전댤된 dimension이 없으면 resize를 위한 _render()를 호출하지 않습니다.', function() {
            spyOn(chartBase, '_render');

            chartBase.resize();

            expect(chartBase._render).not.toHaveBeenCalled();
        });

        it('dimension이 있다면 _updateChartDimension()를 호출하여 dimension을 갱신 합니다.', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(false);
            spyOn(chartBase, '_render');

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(chartBase._updateChartDimension).toHaveBeenCalledWith({
                width: 400,
                height: 300
            });
        });

        it('dimension이 변경된 내용이 없어도 _render()를 호출하지 않습니다.', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(false);
            spyOn(chartBase, '_render');

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(chartBase._render).not.toHaveBeenCalled();
        });

        it('dimension이 변경되었다면, boundsMaker.initBoundsData()에 chart 옵션 정보를 전달하여 bound data를 초기화 합니다.', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(true);
            spyOn(renderUtil, 'renderDimension');
            spyOn(chartBase, '_render');
            chartBase.options = {
                chart: 'chart options'
            };

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(boundsMaker.initBoundsData).toHaveBeenCalledWith('chart options');
        });

        it('dimension이 변경되었다면, renderUtil.renderDimension()에 chartContainer와 갱신된 dimension 정보를 전달하여 너비, 높이를 설정합니다.', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(true);
            spyOn(chartBase, '_render');
            chartBase.options = {
                chart: 'chart options'
            };
            chartBase.chartContainer = 'chart container';
            spyOn(renderUtil, 'renderDimension');


            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(renderUtil.renderDimension).toHaveBeenCalledWith('chart container', {
                width: 400,
                height: 300
            });
        });

        it('dimension이 변경되었다면, _render()를 호출하여 렌더링을 수행합니다.', function() {
            spyOn(chartBase, '_updateChartDimension').and.returnValue(true);
            spyOn(chartBase, '_render');
            chartBase.options = {
                chart: 'chart options'
            };
            chartBase.chartContainer = 'chart container';
            spyOn(renderUtil, 'renderDimension');

            chartBase.resize({
                width: 400,
                height: 300
            });

            expect(chartBase._render).toHaveBeenCalled();
        });
    });
});
