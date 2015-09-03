/**
 * @fileoverview test tooltip
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Tooltip = require('../../src/js/tooltips/tooltip.js');

describe('test Tooltip', function() {
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
        it('툴팁 렌더링에 사용될 data 생성', function () {
            var result = tooltip._makeTooltipData();
            expect(result).toEqual([
                {label: 'Silver', value: 10, legendLabel: 'Density1', id: '0-0'},
                {label: 'Silver', value: 20, legendLabel: 'Density2', id: '0-1'}
            ]);
        });
    });

    describe('_makeTooltipsHtml()', function() {
        it('툴팁 html 생성', function () {
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
        it('id로부터 index 정보 반환', function () {
            var result = tooltip._getIndexFromId('ne-chart-tooltip-0-0');
            expect(result).toEqual(['0', '0']);
        });
    });

    describe('_calculateVerticalPosition()', function() {
        it('포인트 타입의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환', function () {
            var result = tooltip._calculatePointPosition({
                data: {
                    bound: {
                        width: 25,
                        height: 50,
                        top: 50,
                        left: 10
                    }
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: ''
            });

            expect(result).toEqual({
                left: 12,
                top: 14
            });
        });
    });

    describe('_calculateRectPosition()', function() {
        it('Rect 타입의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환', function () {
            var result = tooltip._calculateRectPosition({
                data: {
                    bound: {
                        width: 50,
                        height: 25,
                        top: 10,
                        left: 0
                    }
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: ''
            });

            expect(result).toEqual({
                left: 55,
                top: 8
            });
        });
    });

    describe('_calculatePosition()', function() {
        it('포인트 타입의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환', function () {
            var result = tooltip._calculatePosition({
                data: {
                    bound: {
                        width: 25,
                        height: 50,
                        top: 50,
                        left: 10
                    },
                    isPointPosition: true
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: ''
            });

            expect(result).toEqual({
                left: 12,
                top: 14
            });
        });

        it('Rect 타입의 포지션 정보를 툴팁의 포지션 정보로 계산하여 반환', function () {
            var result = tooltip._calculatePosition({
                data: {
                    bound: {
                        width: 50,
                        height: 25,
                        top: 10,
                        left: 0
                    }
                },
                dimension: {
                    width: 50,
                    height: 30
                },
                positionOption: ''
            });

            expect(result).toEqual({
                left: 55,
                top: 8
            });
        });
    });
});
