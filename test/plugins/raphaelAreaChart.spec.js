/**
 * @fileoverview Test for RaphaelAreaChart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelAreaChart = require('../../src/js/plugins/raphaelAreaChart');

describe('RaphaelAreaChart', function() {
    var areaChart;

    beforeEach(function() {
        areaChart = new RaphaelAreaChart();
    });

    describe('_makeHeight()', function() {
        it('top값과 zeroTop(axis의 0위치 top)의 차를 이용하여 graph의 height값을 구합니다.', function() {
            var actual = areaChart._makeHeight(30, 100),
                expected = 70;
            expect(actual).toBe(expected);
        });
    });

    describe('_findMiddleLeft()', function() {
        it('top의 위치가 0점 기준으로 위 아래에 배치된 두 지점(position)의 중간 지점 left 값을 구합니다.', function() {
            var actual = areaChart._findMiddleLeft({
                    left: 10,
                    top: 10
                }, {
                    left: 30,
                    top: 30
                }, 20),
                expected = 20;
            expect(actual).toBe(expected);
        });

        it('두 지점이 모두 0점 위에 위치할 때에는 -1을 반환합니다.', function() {
            var actual = areaChart._findMiddleLeft({
                    left: 10,
                    top: 10
                }, {
                    left: 20,
                    top: 15
                }, 20),
                expected = -1;
            expect(actual).toBe(expected);
        });

        it('두 지점이 모두 0점 아래에 위치할 때에도 -1을 반환합니다.', function() {
            var actual = areaChart._findMiddleLeft({
                    left: 10,
                    top: 30
                }, {
                    left: 20,
                    top: 40
                }, 20),
                expected = -1;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeAreaPath()', function() {
        it('from position, to position, zero top 정보를 이용하여 area graph의 path를 구합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 30
                }, {
                    left: 30,
                    top: 40
                }, 50),
                expected = 'M10 50L10 30L30 40L30 50';
            expect(actual).toBe(expected);
        });

        it('from position이 zero top 위치에서 시작할 때에는 두번째 그리는 path 정보는 생략합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 50
                }, {
                    left: 30,
                    top: 40
                }, 50),
                expected = 'M10 50L30 40L30 50';
            expect(actual).toBe(expected);
        });

        it('to position이 zero top 위치에서 끝날 때에는 마지막으로 그리는 path 정보는 생략합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 30
                }, {
                    left: 30,
                    top: 50
                }, 50),
                expected = 'M10 50L10 30L30 50';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeAreaPaths()', function() {
        it('from position, to position 정보를 통해 start(랜더링에 사용), end(애니메이션에 사용) area path를 구합니다.', function() {
            var actual = areaChart._makeAreaPaths({
                    left: 10,
                    top: 30
                }, {
                    left: 30,
                    top: 40
                }, 50),
                expected = {
                    start: 'M10 50L10 30L10 30L10 50',
                    end: 'M10 50L10 30L30 40L30 50'
                };
            expect(actual).toEqual(expected);
        });

        it('from position, to position 정보가 0점(zeroTop) 위 아래에 배치될 때에는 중간 값을 지정하여 두가지 영역 정보로 나누어(start, end, addStar, addEnd) 구합니다.', function() {
            var actual = areaChart._makeAreaPaths({
                    left: 10,
                    top: 10
                }, {
                    left: 30,
                    top: 30
                }, 20),
                expected = {
                    start: 'M10 20L10 10L10 10L10 20',
                    end: 'M10 20L10 10L20 20',
                    addStart: 'M20 20L20 20',
                    addEnd: 'M20 20L30 30L30 20'
                };
            expect(actual).toEqual(expected);
        });
    });
});
