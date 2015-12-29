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

    describe('_makeAreaPath()', function() {
        it('from position, to position, zero top 정보를 이용하여 area graph의 path를 구합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }),
                expected = 'M10 50L10 30L30 40L30 50';
            expect(actual).toBe(expected);
        });

        it('from position이 zero top 위치에서 시작할 때에는 두번째 그리는 path 정보는 생략합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 50,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }),
                expected = 'M10 50L30 40L30 50';
            expect(actual).toBe(expected);
        });

        it('to position이 zero top 위치에서 끝날 때에는 마지막으로 그리는 path 정보는 생략합니다.', function() {
            var actual = areaChart._makeAreaPath({
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 50,
                    startTop: 50
                }),
                expected = 'M10 50L10 30L30 50';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeAreaPaths()', function() {
        it('from position, to position 정보를 통해 start(랜더링에 사용), end(애니메이션에 사용) area path를 구합니다.', function() {
            var actual = areaChart._makeAreaPaths({
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }),
                expected = {
                    start: 'M10 50L10 30L10 30L10 50',
                    end: 'M10 50L10 30L30 40L30 50'
                };
            expect(actual).toEqual(expected);
        });
    });
});
