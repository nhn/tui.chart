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
                expected = ['M', 10, 30, 'L', 30, 40, 'L', 30, 50, 'L', 10, 50];
            expect(actual).toEqual(expected);
        });
    });

    describe('_getAreasPath()', function() {
        it('영역 차트를 그리기 위한 area, line path정보를 반환합니다.', function() {
            var actual = areaChart._getAreasPath([[{
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }]]),
                expected = [{
                    area: ['M', 9, 30, 'L', 30, 40, 'L', 30, 50, 'L', 9, 50],
                    line: ['M', 9, 30, 'L', 30, 40]
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

    describe('_getSplineAreasPath()', function() {
        it('spline 영역 차트를 그리기 위한 area, line path정보를 반환합니다.', function() {
            var actual, expected;

            areaChart.zeroTop = 50;
            actual = areaChart._getSplineAreasPath([[{
                left: 10,
                top: 30,
                startTop: 50
            }, {
                left: 30,
                top: 40,
                startTop: 50
            }]]);
            expected = [{
                area: [['M', 8, 30, 'C', 8, 30], [30, 40, 30, 40], ['L', 30, 50], ['L', 8, 50]],
                line: [['M', 8, 30, 'C', 8, 30], [30, 40, 30, 40]]
            }];
            expect(actual).toEqual(expected);
        });
    });
});
