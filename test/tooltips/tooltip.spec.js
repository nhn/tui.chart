/**
 * @fileoverview test tooltip
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Tooltip = require('../../src/js/tooltips/tooltip'),
    chartConst = require('../../src/js/const'),
    dom = require('../../src/js/helpers/domHandler');

describe('Tooltip', function() {
    var tooltip;

    beforeEach(function() {
        tooltip = new Tooltip({
            options: {}
        });
    });

    describe('makeTooltipData()', function() {
        it('툴팁 렌더링에 사용될 data를 생성합니다.', function () {
            var actual, expected;
            tooltip.labels = [
                'Silver',
                'Gold'
            ];
            tooltip.formattedValues = [
                [10, 20]
            ];
            tooltip.legendLabels = ['Density1', 'Density2'];

            actual = tooltip.makeTooltipData();
            expected = [[
                {category: 'Silver', value: 10, legend: 'Density1'},
                {category: 'Silver', value: 20, legend: 'Density2'}
            ]];
            expect(actual).toEqual(expected);
        });
    });

    describe('_setIndexesCustomAttribute()', function() {
        it('툴팁 엘리먼트에 index정보들을 custom attribute로 설정합니다.', function() {
            var elTooltip = dom.create('DIV');
            tooltip._setIndexesCustomAttribute(elTooltip,
                {
                groupIndex: 0,
                index: 1
            });
            expect(elTooltip.getAttribute('data-groupIndex')).toBe('0');
            expect(elTooltip.getAttribute('data-index')).toBe('1');
        });
    });

    describe('_getIndexesCustomAttribute()', function() {
        it('툴팁 엘리먼트에 설정된 index custom attribute들을 객체로 생성하여 반환합니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual;
            elTooltip.setAttribute('data-groupIndex', 0);
            elTooltip.setAttribute('data-index', 1);
            actual = tooltip._getIndexesCustomAttribute(elTooltip);

            expect(actual.groupIndex).toBe(0);
            expect(actual.index).toBe(1);
        });
    });

    describe('_setShowedCustomAttribute()', function() {
        it('툴팁 엘리먼트에 showed custom attribute 값을 설정합니다.', function() {
            var elTooltip = dom.create('DIV');
            tooltip._setShowedCustomAttribute(elTooltip, true);
            expect(elTooltip.getAttribute('data-showed')).toBe('true');
        });
    });

    describe('_isShowedTooltip()', function() {
        it('툴팁에 showed custom attribute값으로 "true"가 설정되어있는 보여지고 있는 상태입니다.', function() {
            var elTooltip = dom.create('DIV'),
                actual;
            elTooltip.setAttribute('data-showed', true);
            actual = tooltip._isShowedTooltip(elTooltip);
            expect(actual).toBe(true);
        });
    });

    describe('_getValueByIndexes()', function() {
        it('indexes 정보를 이용하여 value를 얻어냅니다.', function() {
            var actual, expected;
            tooltip.values = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            actual = tooltip._getValueByIndexes({
                groupIndex: 0,
                index: 2
            });
            expected = 3;
            expect(actual).toBe(expected);
        });
    });

    describe('_getTooltipId()', function() {
        it('툴팁 아이디가 없을 경우에는 생성하여 반환합니다.', function() {
            var actual = tooltip._getTooltipId();
            expect(actual.indexOf(chartConst.TOOLTIP_ID_PREFIX) > -1).toBe(true);
        });

        it('기존에 this.tooltipId가 있을 경우에는 그대로 반환합니다.', function() {
            var actual, expected;
            tooltip.tooltipId = 'tooltip-id';
            actual = tooltip._getTooltipId();
            expected = 'tooltip-id';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeTooltipHtml()', function() {
        it('툴팁 html을 생성합니다.', function() {
            var actual, expected;
            tooltip.data = [[
                {category: 'Silver', value: 10, legend: 'Density1'},
                {category: 'Silver', value: 20, legend: 'Density2'}
            ]];
            tooltip.suffix = 'suffix';
            actual = tooltip._makeTooltipHtml({
                groupIndex: 0,
                index: 1
            });
            expected = '<div class="tui-chart-default-tooltip">' +
                '<div>Silver</div>' +
                '<div><span>Density2</span>:&nbsp;<span>20</span><span>suffix</span></div>' +
                '</div>';
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateTooltipPositionAboutNotBarChart()', function() {
        it('Bar차트가 아닌 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var actual = tooltip._calculateTooltipPositionAboutNotBarChart({
                    bound: {
                        width: 25,
                        height: 50,
                        top: 50,
                        left: 10
                    },
                    dimension: {
                        width: 50,
                        height: 30
                    },
                    positionOption: '',
                    addPosition: {
                        left: 0,
                        top: 0
                    }
                }),
                expected = {
                    left: 10,
                    top: 15
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateTooltipPositionAboutPieChart()', function() {
        it('PIE 차트인 경우에는 마우스 이동 포지션 기준으로 계산하여 반환합니다.', function () {
            var actual, expected;
            tooltip.seriesPosition = {
                left: 10,
                top: 0
            };
            actual = tooltip._calculateTooltipPositionAboutPieChart({
                bound: {},
                eventPosition: {
                    clientX: 50,
                    clientY: 50
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: '',
                addPosition: {
                    left: 0,
                    top: 0
                }
            });
            expected = {
                left: 45,
                top: 15
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateTooltipPositionAboutBarChart()', function() {
        it('Bar차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var acutal = tooltip._calculateTooltipPositionAboutBarChart({
                    bound: {
                        width: 50,
                        height: 25,
                        top: 10,
                        left: 0
                    },
                    id: 'id-0-0',
                    dimension: {
                        width: 50,
                        height: 30
                    },
                    positionOption: '',
                    addPosition: {
                        left: 0,
                        top: 0
                    }
                }),
                expected = {
                    left: 55,
                    top: 10
                };

            expect(acutal).toEqual(expected);
        });
    });

    describe('_moveToSymmetry', function() {
        it('id를 통해서 얻은 value가 음수일 경우 position을 기준점(axis상에 0이 위치하는 좌표값) 대칭 이동 시킵니다.', function() {
            var result;
            tooltip.values = [
                [1, 2, -3],
                [4, 5, 6]
            ];
            result = tooltip._moveToSymmetry(
                {
                    left: 120
                },
                {
                    bound: {
                        left: 60,
                        width: 60
                    },
                    sizeType: 'width',
                    positionType: 'left',
                    indexes: {
                        groupIndex: 0,
                        index: 2
                    },
                    dimension: {
                        width: 50
                    },
                    addPadding: 0
                }
            );

            expect(result).toEqual({
                left: 10
            });
        });
    });

    describe('_calculateTooltipPosition()', function() {
        it('세로 타입 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var result = tooltip._calculateTooltipPosition({
                bound: {
                    width: 25,
                    height: 50,
                    top: 50,
                    left: 10
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: '',
                addPosition: {
                    left: 0,
                    top: 0
                }
            });

            expect(result).toEqual({
                left: 10,
                top: 15
            });
        });

        it('가로 타입 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var result = tooltip._calculateTooltipPosition({
                bound: {
                    width: 50,
                    height: 25,
                    top: 10,
                    left: 0
                },
                chartType: chartConst.CHART_TYPE_BAR,
                id: 'id-0-0',
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: '',
                addPosition: {
                    left: 0,
                    top: 0
                }
            });

            expect(result).toEqual({
                left: 55,
                top: 10
            });
        });
    });
});
