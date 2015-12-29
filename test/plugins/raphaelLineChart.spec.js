/**
 * @fileoverview Test for RaphaelLineChart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineChart = require('../../src/js/plugins/raphaelLineChart');

describe('RaphaelLineChart', function() {
    var lineChart;

    beforeEach(function() {
        lineChart = new RaphaelLineChart();
    });


    describe('_getLinesPath()', function() {
        it('라인 차트를 그리기 위한 path정보를 반환합니다.', function() {
            var actual = lineChart._getLinesPath([[{
                    left: 10,
                    top: 30,
                    startTop: 50
                }, {
                    left: 30,
                    top: 40,
                    startTop: 50
                }]]),
                expected = [['M', 9, 30, 'L', 30, 40]];
            expect(actual).toEqual(expected);
        });
    });

    describe('_getSplineLinesPath()', function() {
        it('spline 라인 차트를 그리기 위한 path정보를 반환합니다.', function() {
            var actual, expected;

            lineChart.zeroTop = 50;
            actual = lineChart._getSplineLinesPath([[{
                left: 10,
                top: 30,
                startTop: 50
            }, {
                left: 30,
                top: 40,
                startTop: 50
            }]]);
            expected = [[['M', 9, 30, 'C', 9, 30], [30, 40, 30, 40]]];
            expect(actual).toEqual(expected);
        });
    });
});
