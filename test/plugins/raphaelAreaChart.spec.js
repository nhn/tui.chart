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

    describe('_makeAreasPath()', function() {
        it('positions의 left, top, startTop 정보를 이용하여 area graph의 path를 구합니다.', function() {
            var actual = areaChart._makeAreasPath([{
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }]),
                expected = [ 'M', 10, 30, 'L', 30, 40, 'L', 30, 40, 'L', 30, 50, 'L', 30, 50, 'L', 10, 50 ];
            expect(actual).toEqual(expected);
        });

        it('hasExtraPath가 false이면 추가 path를 제외합니다.', function() {
            var hasExtraPath = false;
            var actual = areaChart._makeAreasPath([{
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }], hasExtraPath),
                expected = [ 'M', 10, 30, 'L', 30, 40, 'L', 30, 50, 'L', 10, 50 ];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAreaChartPath()', function() {
        it('영역 차트를 그리기 위한 area, line path정보를 반환합니다.', function() {
            var actual = areaChart._makeAreaChartPath([[{
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }]]),
                expected = [{
                    area: ['M', 10, 30, 'L', 30, 40, 'L', 30, 40, 'L', 30, 50, 'L', 30, 50, 'L', 10, 50],
                    line: ['M', 10, 30, 'L', 30, 40]
                }];
            expect(actual).toEqual(expected);
        });

        it('range data를 갖고 있다면 startLine path도 생성합니다.', function() {
            var actual, expected;

            areaChart.hasRangeData = true;
            actual = areaChart._makeAreaChartPath([[{
                left: 10,
                top: 30,
                startTop: 40
            }, {
                left: 30,
                top: 40,
                startTop: 50
            }]]);
            expected = [{
                area: ['M', 10, 30, 'L', 30, 40, 'L', 30, 40, 'L', 30, 50, 'L', 30, 50, 'L', 10, 40],
                line: ['M', 10, 30, 'L', 30, 40],
                startLine: ['M', 10, 40, 'L', 30, 50]
            }];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSplineAreaBottomPath()', function() {
        it('position정보를 이용하여 영역 차트 하단의 path 정보를 생성합니다.', function() {
            var actual, expected;

            areaChart.zeroTop = 50;
            actual = areaChart._makeSplineAreaBottomPath([{
                left: 10
            }, {
                left: 30
            }]);
            expected = [['L', 30, 50], ['L', 10, 50]];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSplineAreaChartPath()', function() {
        it('spline 영역 차트를 그리기 위한 area, line path정보를 반환합니다.', function() {
            var actual, expected;

            areaChart.zeroTop = 50;
            actual = areaChart._makeSplineAreaChartPath([[{
                left: 10,
                top: 30,
                startTop: 50
            }, {
                left: 30,
                top: 40,
                startTop: 50
            }]]);
            expected = [{
                area: [['M', 10, 30, 'C', 10, 30], [30, 40, 30, 40], ['L', 30, 40], ['L', 30, 50], ['L', 30, 50], ['L', 10, 50]],
                line: [['M', 10, 30, 'C', 10, 30], [30, 40, 30, 40]]
            }];
            expect(actual).toEqual(expected);
        });

        it('hasExtraPath가 false이면 추가 path를 제외합니다.', function() {
            var hasExtraPath = false;
            var actual, expected;

            areaChart.zeroTop = 50;
            actual = areaChart._makeSplineAreaChartPath([[{
                left: 10,
                top: 30,
                startTop: 50
            }, {
                left: 30,
                top: 40,
                startTop: 50
            }]], hasExtraPath);
            expected = [{
                area: [['M', 10, 30, 'C', 10, 30], [30, 40, 30, 40], ['L', 30, 50], ['L', 10, 50]],
                line: [['M', 10, 30, 'C', 10, 30], [30, 40, 30, 40]]
            }];
            expect(actual).toEqual(expected);
        });
    });
});
