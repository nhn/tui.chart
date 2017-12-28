/**
 * @fileoverview Test for legendCalculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var legendCalculator = require('../../../src/js/models/bounds/legendCalculator');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for legendCalculator', function() {
    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_calculateLegendsWidthSum()', function() {
        it('calculate sum of legends width', function() {
            var actual = legendCalculator._calculateLegendsWidthSum(
                ['legend1', 'legend2'], {}, chartConst.LEGEND_CHECKBOX_WIDTH
            );
            var expected = 260;

            expect(actual).toBe(expected);
        });
    });

    describe('_divideLegendLabels()', function() {
        it('divide legend labels', function() {
            var actual = legendCalculator._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 2);
            var expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });

        it('divide legend labels, when count for dividing is three', function() {
            var actual = legendCalculator._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 3);
            var expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']];

            expect(actual).toEqual(expected);
        });

        it('if count is one, retuns original labels', function() {
            var actual = legendCalculator._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 1);
            var expected = [['ABC1', 'ABC2', 'ABC3', 'ABC4']];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeDividedLabelsAndMaxLineWidth()', function() {
        it('make divided labels and max line width.', function() {
            /**
             * 251: chart length = max line width + 1
             * devision loop ending condition: chart length > max line width
             */
            var actual = legendCalculator._makeDividedLabelsAndMaxLineWidth(
                ['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 261, {}, chartConst.LEGEND_CHECKBOX_WIDTH
            );
            var expected = {
                labels: [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']],
                maxLineWidth: 260 /* max line width */
            };

            expect(actual).toEqual(expected);
        });

        it('make divided labels and max line width, when chart width less than label width', function() {
            var actual = legendCalculator._makeDividedLabelsAndMaxLineWidth(
                ['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'], 120, {}, chartConst.LEGEND_CHECKBOX_WIDTH
            );
            var expected = {
                labels: [['ABC1'], ['ABC2'], ['ABC3'], ['ABC4'], ['ABC5']],
                maxLineWidth: 130 /* width of a legend item */
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateHorizontalLegendHeight()', function() {
        it('calculate horizontal height for legend', function() {
            var actual = legendCalculator._calculateHorizontalLegendHeight(
                [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']]
            );
            var expected = 70;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeHorizontalDimension()', function() {
        it('calculate horizontal dimension', function() {
            var actual = legendCalculator._makeHorizontalDimension(
                {}, ['label1', 'label12'], 300, chartConst.LEGEND_CHECKBOX_WIDTH
            );
            var expected = {
                width: 260,
                height: 40
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeVerticalDimension()', function() {
        it('calculate vertical dimension', function() {
            var actual, expected;

            actual = legendCalculator._makeVerticalDimension(
                {}, ['label1', 'label12'], chartConst.LEGEND_CHECKBOX_WIDTH);
            expected = 130;

            expect(actual.width).toBe(expected);
        });
    });

    describe('calculate()', function() {
        it('if visible options is false, returns 0', function() {
            var options = {
                visible: false
            };
            var actual;

            actual = legendCalculator.calculate(options);

            expect(actual.width).toBe(0);
        });

        it('calculate dimension for legend, when horizontal type', function() {
            var options = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_TOP
            };
            var labelTheme = {};
            var legendLabels = ['label1', 'label12'];
            var chartWidth = 200;
            var actual, expected;

            actual = legendCalculator.calculate(options, labelTheme, legendLabels, chartWidth);
            expected = legendCalculator._makeHorizontalDimension(labelTheme, legendLabels,
                chartWidth, chartConst.LEGEND_CHECKBOX_WIDTH + chartConst.LEGEND_LABEL_LEFT_PADDING);

            expect(actual).toEqual(expected);
        });

        it('calculate dimension for legend, when vertical type', function() {
            var options = {
                visible: true,
                align: chartConst.LEGEND_ALIGN_LEFT
            };
            var labelTheme = {};
            var legendLabels = ['label1', 'label12'];
            var actual, expected;

            actual = legendCalculator.calculate(options, labelTheme, legendLabels);
            expected = legendCalculator._makeVerticalDimension(labelTheme, legendLabels,
                chartConst.LEGEND_CHECKBOX_WIDTH + chartConst.LEGEND_LABEL_LEFT_PADDING);

            expect(actual).toEqual(expected);
        });
    });
});
