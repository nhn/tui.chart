/**
 * @fileoverview Test for GroupTooltip.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTooltip = require('../../src/js/tooltips/groupTooltip'),
    defaultTheme = require('../../src/js/themes/defaultTheme'),
    dom = require('../../src/js/helpers/domHandler');

describe('GroupTooltip', function() {
    var tooltip, dataProcessor;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getWholeFormattedValues', 'getCategory', 'getWholeLegendData', 'getLegendData']);
    });

    beforeEach(function() {
        tooltip = new GroupTooltip({
            dataProcessor: dataProcessor,
            options: {}
        });
    });

    describe('_makeTooltipData()', function() {
        it('그룹 툴팁 렌더링에 사용될 기본 data를 생성합니다.', function () {
            var actual, expected;

            dataProcessor.getWholeFormattedValues.and.returnValue([
                ['10', '20'],
                ['30', '40']
            ]);
            dataProcessor.getCategory.and.callFake(function(index) {
                var categories = [
                    'Silver',
                    'Gold'
                ];
                return categories[index];
            });

            actual = tooltip._makeTooltipData();
            expected = [
                {category: 'Silver', values: ['10', '20']},
                {category: 'Gold', values: ['30', '40']}
            ];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeColors()', function() {
        it('툴팁 테마에 colors가 설정되어있으면 그대로 반환합니다.', function() {
            var actual, expected;

            dataProcessor.getWholeLegendData.and.returnValue([{
                chartType: 'column',
                label: 'legend1'
            }, {
                chartType: 'column',
                label: 'legend2'
            }]);

            actual = tooltip._makeColors({
                colors: ['red', 'blue']
            });
            expected = ['red', 'blue'];

            expect(actual).toEqual(expected);
        });

        it('툴팁 테마에 colors값이 없으면 기본 series 색상 정보를 반환합니다.', function() {
            var legendLabels = [{
                    chartType: 'column',
                    label: 'legend1'
                }, {
                    chartType: 'column',
                    label: 'legend2'
                }],
                actual = tooltip._makeColors(legendLabels, {}),
                expected = defaultTheme.series.colors.slice(0, 2);
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeItemRenderingData()', function() {
        it('렌더링에 사용할 item data를 생성합니다.', function() {
            var actual, expected;

            dataProcessor.getLegendData.and.callFake(function(index) {
                var legendData = [
                    {
                        chartType: 'column',
                        label: 'legend1'
                    },
                    {
                        chartType: 'line',
                        label: 'legend2'
                    }
                ];
                return legendData[index];
            });

            tooltip.suffix = 'suffix';

            actual = tooltip._makeItemRenderingData(['20', '30']);
            expected = [
                {
                    value: '20',
                    legend: 'legend1',
                    chartType: 'column',
                    suffix: 'suffix'
                },
                {
                    value: '30',
                    legend: 'legend2',
                    chartType: 'line',
                    suffix: 'suffix'
                }
            ];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeGroupTooltipHtml()', function() {
        it('전달하는 index에 해당하는 datum을 추출하여 기본 그룹 툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = [
                {category: 'Silver', values: ['10']},
                {category: 'Gold', values: ['30']}
            ];
            tooltip.theme = {
                colors: ['red']
            };
            actual = tooltip._makeGroupTooltipHtml(1);
            expected = '<div class="tui-chart-default-tooltip tui-chart-group-tooltip">' +
                '<div>Gold</div>' +
                    '<div>' +
                        '<div class="tui-chart-legend-rect column" style="background-color:red"></div>' +
                        '&nbsp;<span>legend1</span>:&nbsp;<span>30</span><span></span>' +
                    '</div>' +
                '</div>';
            expect(actual).toBe(expected);
        });

        it('전달하는 index에 해당하는 datum을 추출하여 template 그룹 툴팁 html을 생성합니다.', function() {
            var actual, expected;

            tooltip.templateFunc = function(category, items) {
               var head = '<div>' + category + '</div>',
                   body = tui.util.map(items, function(item) {
                       return '<div>' + item.legend + ': ' + item.value + '</div>';
                   }).join('');
               return head + body;
            };

            tooltip.data = [
                {category: 'Silver', values: ['10']},
                {category: 'Gold', values: ['30', '20']}
            ];
            tooltip.theme = {
                colors: ['red']
            };

            actual = tooltip._makeGroupTooltipHtml(1);
            expected = '<div>Gold</div>' +
                '<div>legend1: 30</div>' +
                '<div>legend2: 20</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_getTooltipSectorElement', function() {
        it('툴팁 섹터 엘리먼트를 얻습니다.', function() {
            var tooltipContainer = dom.create('DIV'),
                actual;
            tooltip.tooltipContainer = tooltipContainer;
            actual = tooltip._getTooltipSectorElement();
            expect(actual).toBeDefined();
            expect(actual.className).toBe('tui-chart-group-tooltip-sector');
        });

        it('this.elTooltipSector이 존재하면 그대로 반환합니다.', function() {
            var groupTooltipSector = dom.create('DIV'),
                actual, expected;
            tooltip.groupTooltipSector = groupTooltipSector;
            actual = tooltip._getTooltipSectorElement();
            expected = groupTooltipSector;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeVerticalTooltipSectorBound()', function() {
        it('라인타입 차트의 세로영역 툴팁 섹터 bound 정보를 생성합니다.', function() {
            var actual = tooltip._makeVerticalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, true),
                expected = {
                    dimension: {
                        width: 1,
                        height: 206
                    },
                    position: {
                        left: 10,
                        top: 10
                    }
                };
            expect(actual).toEqual(expected);
        });

        it('라인타입 차트가 아닌경우의 세로영역 툴팁 섹터 bound 정보를 생성합니다.', function() {
            var actual = tooltip._makeVerticalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, false),
                expected = {
                    dimension: {
                        width: 50,
                        height: 200
                    },
                    position: {
                        left: 10,
                        top: 10
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeHorizontalTooltipSectorBound()', function() {
        it('가로영역 툴팁 섹터 bound 정보를 생성합니다.', function() {
            var actual = tooltip._makeHorizontalTooltipSectorBound(200, {
                    start: 0,
                    end: 50
                }, false),
                expected = {
                    dimension: {
                        width: 200,
                        height: 51
                    },
                    position: {
                        left: 9,
                        top: 10
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTooltipSectorBound()', function() {
        it('세로타입의 차트의 경우는 _makeVerticalTooltipSectorBound()의 실행 결과를 반환합니다.', function() {
            var size = 200,
                range = {
                    start: 0,
                    end: 5
                },
                isVertical = true,
                isLine = true,
                actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine),
                expected = tooltip._makeVerticalTooltipSectorBound(size, range, isLine);
            expect(actual).toEqual(expected);
        });

        it('가로타입의 차트의 경우는 _makeHorizontalTooltipSectorBound()의 실행 결과를 반환합니다.', function() {
            var size = 200,
                range = {
                    start: 0,
                    end: 5
                },
                isVertical = false,
                isLine = true,
                actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine),
                expected = tooltip._makeHorizontalTooltipSectorBound(size, range, isLine);
            expect(actual).toEqual(expected);
        });
    });
});
