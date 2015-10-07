/**
 * @fileoverview Test for RaphaelBarChart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelBarChart = require('../../src/js/plugins/raphaelBarChart');

describe('RaphaelBarChart', function() {
    var barChart;

    beforeEach(function() {
        barChart = new RaphaelBarChart();
    });

    describe('_makeRectPoints()', function() {
        it('전달하는 rect bound 정보를 가지고 사방(왼쪽위, 오른쪽위, 오른쪽아래, 왼쪽아래) position 정보를 구합니다.', function() {
            var actual = barChart._makeRectPoints({
                    left: 10,
                    top: 10,
                    width: 100,
                    height: 40
                }),
                expected = {
                    leftTop: {
                        left: 10,
                        top: 10
                    },
                    rightTop: {
                        left: 111,
                        top: 10
                    },
                    rightBottom: {
                        left: 111,
                        top: 50
                    },
                    leftBottom: {
                        left: 10,
                        top: 50
                    }
                };
            expect(actual).toEqual(expected);
        });

        it('기본적으로 모든 data는 올림 처리 되며, rightTop.left, rightBottom.left 정보만 버림 처리 됩니다.', function() {
            var actual = barChart._makeRectPoints({
                    left: 10.2,
                    top: 10.2,
                    width: 100,
                    height: 40
                }),
                expected = {
                    leftTop: {
                        left: 11,
                        top: 11
                    },
                    rightTop: {
                        left: 111,
                        top: 11
                    },
                    rightBottom: {
                        left: 111,
                        top: 51
                    },
                    leftBottom: {
                        left: 11,
                        top: 51
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTopLinePath()', function() {
        it('top 영역의 line path를 구합니다.', function() {
            var actual = barChart._makeTopLinePath({
                    left: 10,
                    top: 10
                }, {
                    left: 50,
                    top: 10
                }, 'bar'),
                expected = 'M10 9.5L50 9.5';
            expect(actual).toBe(expected);
        });
        it('top 영역의 line path의 left 정보는 column차트이거나 음수일 경우에는 1만큼 더 빼줍니다.', function() {
            var actual = barChart._makeTopLinePath({
                    left: 10,
                    top: 10
                }, {
                    left: 50,
                    top: 10
                }, 'column'),
                expected = 'M9 9.5L50 9.5';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeBorderLinesPaths()', function() {
        it('bar 차트이면서 value가 양수인 경우에는 top, right, bottom의 path 정보를 반환합니다.', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', 10);

            expect(!!actual.top).toBe(true);
            expect(!!actual.right).toBe(true);
            expect(!!actual.bottom).toBe(true);
            expect(!!actual.left).not.toBe(true);
        });

        it('bar 차트이면서 value가 음수인 경우에는 top, bottom, left의 path 정보를 반환합니다.', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', -10);

            expect(!!actual.top).toBe(true);
            expect(!!actual.right).not.toBe(true);
            expect(!!actual.bottom).toBe(true);
            expect(!!actual.left).toBe(true);
        });

        it('column 차트이면서 value가 양수인 경우에는 top, right, left의 path 정보를 반환합니다.', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', 10);

            expect(!!actual.top).toBe(true);
            expect(!!actual.right).toBe(true);
            expect(!!actual.bottom).not.toBe(true);
            expect(!!actual.left).toBe(true);
        });

        it('column 차트이면서 value가 음수인 경우에는 right, bottom, left의 path 정보를 반환합니다.', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', -10);

            expect(!!actual.top).not.toBe(true);
            expect(!!actual.right).toBe(true);
            expect(!!actual.bottom).toBe(true);
            expect(!!actual.left).toBe(true);
        });
    });
});
