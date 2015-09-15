/**
 * @fileoverview test tooltip
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Tooltip = require('../../src/js/tooltips/tooltip.js'),
    chartConst = require('../../src/js/const.js');

describe('Tooltip', function() {
    var data = {
            labels: [
                'Silver',
                'Gold'
            ],
            values: [
                [10, 20]
            ],
            legendLabels: ['Density1', 'Density2']
        },
        bound = {
            dimension: {
                width: 100,
                height: 200
            },
            position: {
                top: 20,
                left: 50
            }
        },
        tooltip;

    beforeEach(function() {
        tooltip = new Tooltip({
            values: data.values,
            labels: data.labels,
            legendLabels: data.legendLabels,
            prefix: 'ne-chart-tooltip-',
            theme: {},
            bound: bound,
            options: {}
        });
    });

    describe('_makeTooltipData()', function() {
        it('툴팁 렌더링에 사용될 data를 생성합니다.', function () {
            var result = tooltip._makeTooltipData();
            expect(result).toEqual([
                {label: 'Silver', value: 10, legendLabel: 'Density1', id: '0-0'},
                {label: 'Silver', value: 20, legendLabel: 'Density2', id: '0-1'}
            ]);
        });
    });

    describe('_makeTooltipsHtml()', function() {
        it('툴팁 html을 생성합니다.', function () {
            var resultHtml = tooltip._makeTooltipsHtml(),
                compareHtml = '<div class="ne-chart-tooltip" id="ne-chart-tooltip-0-0"><div class="ne-chart-default-tooltip">' +
                    '<div>Silver</div>' +
                    '<div><span>Density1</span>:&nbsp;' +
                    '<span>10</span><span></span></div>' +
                    '</div></div>' +
                    '<div class="ne-chart-tooltip" id="ne-chart-tooltip-0-1"><div class="ne-chart-default-tooltip">' +
                    '<div>Silver</div>' +
                    '<div><span>Density2</span>:&nbsp;' +
                    '<span>20</span><span></span></div>' +
                    '</div></div>';
            expect(resultHtml).toEqual(compareHtml);
        });
    });

    describe('_getIndexFromId()', function() {
        it('id로부터 index 정보를 추출하여 반환합니다.', function () {
            var result = tooltip._getIndexFromId('ne-chart-tooltip-0-0');
            expect(result).toEqual(['0', '0']);
        });
    });

    describe('_calculateTooltipPositionAboutNotBarChart()', function() {
        it('Bar차트가 아닌 차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var result = tooltip._calculateTooltipPositionAboutNotBarChart({
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
                left: 12,
                top: 14
            });
        });
    });

    describe('_calculateTooltipPositionAboutBarChart()', function() {
        it('Bar차트의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환합니다.', function () {
            var result = tooltip._calculateTooltipPositionAboutBarChart({
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
            });

            expect(result).toEqual({
                left: 55,
                top: 8
            });
        });
    });

    describe('_getValueById', function() {
        it('tooltip id를 통해서 value값을 얻어내어 반환합니다.', function() {
            var result;
            tooltip.values = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            result = tooltip._getValueById('id-0-2');
            expect(result).toEqual(3);
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
                    id: 'id-0-2',
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
                left: 12,
                top: 14
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
                top: 8
            });
        });
    });
});
