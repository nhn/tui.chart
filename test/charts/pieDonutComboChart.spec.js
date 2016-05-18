/**
 * @fileoverview Test for PieDonutComboChart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PieDonutComboChart = require('../../src/js/charts/pieDonutComboChart.js');

describe('Test for PieDonutComboChart', function() {
    var comboChart;

    beforeEach(function() {
        comboChart = new PieDonutComboChart({
            series: {}
        }, {
            chart: {}
        }, {});
    });

    describe('_makeOptionsMapForPieDonutCombo()', function() {
        it('pie.radiusRatio옵션이 없으면 기본 옵션인 0.7을 설정합니다.', function() {
            var actual;

            spyOn(comboChart, '_makeOptionsMap').and.returnValue({
                pie: {},
                donut: {}
            });

            actual = comboChart._makeOptionsMapForPieDonutCombo();

            expect(actual.pie.radiusRatio).toBe(0.7);
        });

        it('donut.holeRatio옵션이 없으면 기본 옵션인 0.7을 설정합니다.', function() {
            var actual;

            spyOn(comboChart, '_makeOptionsMap').and.returnValue({
                pie: {},
                donut: {}
            });

            actual = comboChart._makeOptionsMapForPieDonutCombo();

            expect(actual.donut.holeRatio).toBe(0.7);
        });

        it('pie.radiusRatio가 donut.holeRatio보다 크면 donut.holeRatio값으로 설정합니다.', function() {
            var actual;

            spyOn(comboChart, '_makeOptionsMap').and.returnValue({
                pie: {
                    radiusRatio: 0.8
                },
                donut: {
                    holeRatio: 0.5
                }
            });

            actual = comboChart._makeOptionsMapForPieDonutCombo();

            expect(actual.pie.radiusRatio).toBe(0.5);
        });

        it('pie.radiusRatio가 값이 있으면서 donut.radiusRatio값이 0보다 크면 pie.radiusRatio에 donut.radiusRatio를 곱한값을 설정합니다.', function() {
            var actual;

            spyOn(comboChart, '_makeOptionsMap').and.returnValue({
                pie: {
                    radiusRatio: 0.6
                },
                donut: {
                    radiusRatio: 0.5
                }
            });

            actual = comboChart._makeOptionsMapForPieDonutCombo();

            expect(actual.pie.radiusRatio).toBe(0.3);
        });
    });
});
