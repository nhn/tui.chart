/**
 * @fileoverview Test for circleLegendCalculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var circleLegendCalculator = require('../../../src/js/models/bounds/circleLegendCalculator');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for circleLegendCalculator', function() {
    describe('_calculatePixelStep()', function() {
        it('calculate pixel step, when axis data is label type', function() {
            var actual = circleLegendCalculator._calculatePixelStep({
                tickCount: 4,
                isLabelAxis: true
            }, 240);

            expect(actual).toBe(30);
        });

        it('when axis data is not label type', function() {
            var actual = circleLegendCalculator._calculatePixelStep({
                tickCount: 4
            }, 240);

            expect(actual).toBe(80);
        });
    });

    describe('_calculateRadiusByAxisData()', function() {
        it('calculate radius by axis data', function() {
            var seriesDimension = {
                width: 400,
                height: 240
            };
            var axisDataMap = {
                xAxis: {
                    tickCount: 5
                },
                yAxis: {
                    tickCount: 4
                }
            };
            var actual = circleLegendCalculator._calculateRadiusByAxisData(seriesDimension, axisDataMap);

            expect(actual).toBe(80);
        });
    });

    describe('_getCircleLegendLabelMaxWidth()', function() {
        it('get max width of label for circle legend', function() {
            var maxLabel = '1,000';
            var fontFamily = 'Verdana';
            var actual;

            spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);

            actual = circleLegendCalculator._getCircleLegendLabelMaxWidth(maxLabel, fontFamily);

            expect(renderUtil.getRenderedLabelWidth).toHaveBeenCalledWith('1,000', {
                fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
                fontFamily: 'Verdana'
            });
            expect(actual).toBe(50);
        });
    });

    describe('calculateCircleLegendWidth()', function() {
        it('calculate width of circle legend', function() {
            var seriesDimension = {
                width: 400,
                height: 240
            };
            var axisDataMap = {
                xAxis: {
                    tickCount: 5,
                    isLabelAxis: true
                },
                yAxis: {
                    tickCount: 4
                }
            };
            var maxLabel = '1,000';
            var fontFamily = 'Verdana';
            var actual;

            actual = circleLegendCalculator.calculateCircleLegendWidth(
                seriesDimension, axisDataMap, maxLabel, fontFamily
            );

            expect(actual).toBe(90);
        });
    });

    describe('calculateMaxRadius()', function() {
        it('maxRadius should be calculated normally even without circlelegend.', function() {
            var axisDataMap = {
                xAxis: {
                    tickCount: 4
                },
                yAxis: {
                    tickCount: 4
                }
            };
            var dimensionMap = {
                circleLegend: {
                    width: 0
                },
                series: {
                    width: 300,
                    height: 300
                }
            };

            expect(circleLegendCalculator.calculateMaxRadius(dimensionMap, axisDataMap)).toBe(100);
        });
    });
});
