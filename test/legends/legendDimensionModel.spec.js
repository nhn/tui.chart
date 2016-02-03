/**
 * @fileoverview test legend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LegendDimensionModel = require('../../src/js/legends/legendDimensionModel'),
    chartConst = require('../../src/js/const'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('test Legend', function() {
    var dimensionModel;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        dimensionModel = new LegendDimensionModel({
            options: {},
            theme: {}
        });
    });

    //legend dimension model
    describe('_makeLegendWidth()', function() {
        it('체크박스, 아이콘, 여백이 포함된 범례 너비를 반환합니다.', function() {
            var actual, expected;

            actual = dimensionModel._makeLegendWidth(40);
            expected = 87;

            expect(actual).toBe(expected);
        });
    });

    describe('_calculateLegendsWidthSum()', function() {
        it('여러 범례 길이의 합을 구합니다.', function() {
            var actual = dimensionModel._calculateLegendsWidthSum(['legend1', 'legend2']),
                expected = 194;

            expect(actual).toBe(expected);
        });
    });

    describe('_divideLegendLabels()', function() {
        it('입력 배열을 count만큼으로 나누어 2차원 배열로 반환합니다.', function() {
            var actual = dimensionModel._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 2),
                expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });

        it('앞쪽에서부터 나누어진 숫자 만큼씩 차례대로 채워나갑니다.', function() {
            var actual = dimensionModel._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 3),
                expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']];

            expect(actual).toEqual(expected);
        });

        it('1로 나눌 경우에는 그대로 반환됩니다.', function() {
            var actual = dimensionModel._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 1),
                expected = [['ABC1', 'ABC2', 'ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeDividedLabelsAndMaxLineWidth()', function() {
        it('차트의 너비를 넘어서지 않을때 까지 레이블들을 나누고 나눈 결과와 그때의 최대 너비를 반환합니다.', function() {
            var actual = dimensionModel._makeDividedLabelsAndMaxLineWidth(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 250),
                expected = {
                    dividedLabels: [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']],
                    maxLineWidth: 194
                };

            expect(actual).toEqual(expected);
        });

        it('차트의 너비가 레이블 너비보다 작다면 현재의 레이블 정보와 최대 너비를 반환합니다.', function() {
            var actual = dimensionModel._makeDividedLabelsAndMaxLineWidth(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 100),
                expected = {
                    dividedLabels: [['ABC1'], ['ABC2'], ['ABC3'], ['ABC4'], ['ABC5']],
                    maxLineWidth: 97
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateHorizontalLegendHeight()', function() {
        it('가로 범례의 높이를 구합니다.', function() {
            var actual = dimensionModel._calculateHorizontalLegendHeight([['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']]),
                expected = 60;
            expect(actual).toBe(expected);
        });
    });

    describe('_makeHorizontalDimension()', function() {
        it('가로타입 범례의 Dimension을 구합니다.', function() {
            var actual, expected;

            dimensionModel.legendLabels = ['label1', 'label12'];

            actual = dimensionModel._makeHorizontalDimension(250);
            expected = {
                width: 194,
                height: 40
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeVerticalDimension()', function() {
        it('세로타입 범례의 Dimension을 구합니다.', function() {
            var actual, expected;

            dimensionModel.legendLabels = ['label1', 'label12'];

            actual = dimensionModel._makeVerticalDimension();
            expected = 97;

            expect(actual.width).toBe(expected);
        });
    });

    describe('_isSkipLegend()', function() {
        it('파이 차트이면서 align 옵션이 pie전용 align인 "center"나 "outer"이면 true를 반환합니다.', function() {
            var actual, expected;

            dimensionModel.chartType = chartConst.CHART_TYPE_PIE;
            dimensionModel.options.align = chartConst.LEGEND_ALIGN_CENTER;

            actual = dimensionModel._isSkipLegend();
            expected = true;

            expect(actual).toBe(expected);
        });

        it('align이 hidden이면 true를 반환합니다.', function() {
            var actual, expected;

            dimensionModel.options.hidden = true;

            actual = dimensionModel._isSkipLegend();
            expected = true;

            expect(actual).toBe(expected);
        });
    });

    describe('makeDimension()', function() {
        it('_isSkipLegend()의 결과가 true이면 0을 반환합니다.', function () {
            var actual;

            spyOn(dimensionModel, '_isSkipLegend').and.returnValue(true);

            actual = dimensionModel.makeDimension();

            expect(actual.width).toBe(0);
        });

        it('가로타입 범례의 경우 _makeHorizontalDimension의 수행 결과를 반환합니다.', function () {
            var actual, expected;

            dimensionModel.legendLabels = ['label1', 'label12'];
            dimensionModel.options.align = chartConst.LEGEND_ALIGN_TOP;

            actual = dimensionModel.makeDimension(200);
            expected = dimensionModel._makeHorizontalDimension(200);

            expect(actual).toEqual(expected);
        });

        it('세로타입 범례의 경우 _makeVerticalDimension의 수행 결과를 반환합니다.', function () {
            var actual, expected;

            dimensionModel.legendLabels = ['label1', 'label12'];
            dimensionModel.options.align = chartConst.LEGEND_ALIGN_LEFT;

            actual = dimensionModel.makeDimension();
            expected = dimensionModel._makeVerticalDimension();

            expect(actual).toEqual(expected);
        });


    });

});
