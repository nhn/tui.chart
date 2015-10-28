/**
 * @fileoverview test groupTooltip
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var GroupTooltip = require('../../src/js/tooltips/groupTooltip'),
    chartConst = require('../../src/js/const'),
    defaultTheme = require('../../src/js/themes/defaultTheme');

describe('GroupTooltip', function() {
    var tooltip;

    beforeEach(function() {
        tooltip = new GroupTooltip({
            options: {}
        });
    });

    describe('makeTooltipData()', function() {
        it('그룹 툴팁 렌더링에 사용될 기본 data를 생성합니다.', function () {
            var actual, expected;
            tooltip.labels = [
                'Silver',
                'Gold'
            ];
            tooltip.joinFormattedValues = [
                ['10', '20'],
                ['30', '40']
            ];

            actual = tooltip.makeTooltipData();
            expected = [
                {category: 'Silver', values: ['10', '20']},
                {category: 'Gold', values: ['30', '40']}
            ];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeColors()', function() {
        it('툴팁 테마에 colors가 설정되어있으면 그대로 반환합니다.', function() {
            var legendLabels = [{
                    chartType: 'column',
                    label: 'legend1'
                }, {
                    chartType: 'column',
                    label: 'legend2'
                }],
                actual = tooltip._makeColors(legendLabels, {
                    colors: ['red', 'blue']
                }),
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

    describe('_makeTooltipHtml()', function() {
        it('기본 툴팁 data에서 전달하는 index에 해당하는 data를 추출하여 툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = [
                {category: 'Silver', values: ['10']},
                {category: 'Gold', values: ['30']}
            ];
            tooltip.joinLegendLabels = [{
                chartType: 'column',
                label: 'legend1'
            }];
            tooltip.theme = {
                colors: ['red']
            };
            actual = tooltip._makeTooltipHtml(1);
            expected = '<div class="ne-chart-default-tooltip ne-chart-group-tooltip">' +
                '<div>Gold</div>' +
                    '<div>' +
                        '<div class="ne-chart-legend-rect column" style="background-color:red"></div>' +
                        '&nbsp;<span>legend1</span>:&nbsp;<span>30</span><span></span>' +
                    '</div>' +
                '</div>';
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateVerticalPosition()', function() {
        it('세로 타입의 차트의 툴팁 position 정보를 계산합니다.', function() {
            var actual = tooltip._calculateVerticalPosition({
                    width: 80,
                    height: 100
                }, {
                    range: {
                        start: 0,
                        end: 100
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_FORWORD,
                    size: 200
                }),
                expected = {
                    left: 10,
                    top: 50
                };
            expect(actual).toEqual(expected);
        });
        it('중간 틱 이후부터는 틱 영역 끝지점 부터 툴팁이 뜨도록 position 정보를 계산합니다.', function() {
            var actual = tooltip._calculateVerticalPosition({
                    width: 80,
                    height: 100
                }, {
                    range: {
                        start: 100,
                        end: 200
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWORD,
                    size: 200
                }),
                expected = {
                    left: 130,
                    top: 50
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateHorizontalPosition()', function() {
        it('가로 타입의 차트의 툴팁 position 정보를 계산합니다.', function() {
            var actual = tooltip._calculateHorizontalPosition({
                    width: 80,
                    height: 100
                }, {
                    range: {
                        start: 0,
                        end: 100
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_FORWORD,
                    size: 200
                }),
                expected = {
                    left: 70,
                    top: 0
                };
            expect(actual).toEqual(expected);
        });
        it('중간 틱 이후부터는 틱 영역 끝지점 부터 툴팁이 뜨도록 position 정보를 계산합니다.', function() {
            var actual = tooltip._calculateHorizontalPosition({
                    width: 80,
                    height: 100
                }, {
                    range: {
                        start: 100,
                        end: 200
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_BACKWORD,
                    size: 200
                }),
                expected = {
                    left: 70,
                    top: 100
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateTooltipPosition()', function() {
        it('세로 툴팁의 경우 _calculateVerticalPosition()의 계산 결과의 값을 반환합니다.', function() {
            var dimension = {
                    width: 80,
                    height: 100
                },
                params = {
                    range: {
                        start: 0,
                        end: 100
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_FORWORD,
                    size: 200,
                    isVertical: true
                },
                actual, expected;
            actual = tooltip._calculateTooltipPosition(dimension, params);
            expected = tooltip._calculateVerticalPosition(dimension, params);
            expect(actual).toEqual(expected);
        });

        it('가로 툴팁의 경우 _calculateHorizontalPosition()의 계산 결과의 값을 반환합니다.', function() {
            var dimension = {
                    width: 80,
                    height: 100
                },
                params = {
                    range: {
                        start: 0,
                        end: 100
                    },
                    direction: chartConst.TOOLTIP_DIRECTION_FORWORD,
                    size: 200
                },
                actual, expected;
            actual = tooltip._calculateTooltipPosition(dimension, params);
            expected = tooltip._calculateHorizontalPosition(dimension, params);
            expect(actual).toEqual(expected);
        });
    });
});
