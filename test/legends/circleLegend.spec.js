/**
 * @fileoverview test circleLegend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var CircleLegend = require('../../src/js/legends/circleLegend');
var renderUtil = require('../../src/js/helpers/renderUtil');

describe('Test for CircleLegend', function() {
    var circleLegend, dataProcessor, boundsMaker;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFormatFunctions', 'getMaxValue', 'getFormattedMaxValue']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension', 'getMaxRadiusForBubbleChart', 'getMinimumPixelStepForAxis']);
        circleLegend = new CircleLegend({
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker
        });
    });

    describe('_formatLabel()', function() {
        it('소수점 이하 길이가 0인 경우는 정수로 변환하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.getFormatFunctions.and.returnValue([]);
            actual = circleLegend._formatLabel(10.22, 0);
            expected = '10';

            expect(actual).toBe(expected);
        });

        it('소수점 이하 길이가 0보다 큰 경우는 소수점 길이만큼 변환하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.getFormatFunctions.and.returnValue([]);
            actual = circleLegend._formatLabel(10.223, 2);
            expected = '10.22';

            expect(actual).toBe(expected);
        });

        it('formatFunction이 존재하는 경우 포맷팅 하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.getFormatFunctions.and.returnValue([function(value) {
                return '00' + value;
            }]);
            actual = circleLegend._formatLabel(10.22, 0);
            expected = '0010';

            expect(actual).toBe(expected);
        });
    });

    describe('_makeLabelHtml()', function() {
        it('circle legend label 영역의 html을 생성합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 80,
                height: 80
            });
            boundsMaker.getMaxRadiusForBubbleChart.and.returnValue(30);
            dataProcessor.getMaxValue.and.returnValue(300);
            spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(12);
            spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(20);

            actual = circleLegend._makeLabelHtml();
            expected = '<div class="tui-chart-circle-legend-label" style="left: 30px;top: 8px">300</div>' +
                '<div class="tui-chart-circle-legend-label" style="left: 30px;top: 38px">150</div><' +
                'div class="tui-chart-circle-legend-label" style="left: 30px;top: 53px">75</div>';

            expect(actual).toBe(expected);
        });
    });

    describe('_getCircleLegendLabelMaxWidth()', function() {
        it('가장 큰 반지름 값과 CirleLegend label의 테마 정보를 renderUtil.getRenderedLabelWidth에 전달하여 레이블 너비를 구합니다.', function() {
            dataProcessor.getFormattedMaxValue.and.returnValue('1,000');
            spyOn(renderUtil, 'getRenderedLabelWidth');
            circleLegend.labelTheme.fontFamily = 'Verdana';
            circleLegend._getCircleLegendLabelMaxWidth();

            expect(renderUtil.getRenderedLabelWidth).toHaveBeenCalledWith('1,000', {
                fontSize: 9,
                fontFamily: 'Verdana'
            });
        });

        it('renderUtil.getRenderedLabelWidth의 결과를 반환합니다.', function() {
            var actual, expected;

            spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(20);
            circleLegend.theme = {
                chart: {
                    fontFamily: 'Verdana'
                }
            };

            actual = circleLegend._getCircleLegendLabelMaxWidth();
            expected = 20;

            expect(actual).toBe(expected);
        });
    });

    describe('_getCircleLegendWidth()', function() {
        it('CircleLegend의 circle너비와 label너비 중 큰 값에 여백값을 더하여 반환합니다.', function() {
            var actual, expected;

            boundsMaker.getMinimumPixelStepForAxis.and.returnValue(20);
            spyOn(circleLegend, '_getCircleLegendLabelMaxWidth').and.returnValue(65);
            circleLegend.legendOption = {};

            actual = circleLegend._getCircleLegendWidth();
            expected = 75;

            expect(actual).toBe(expected);
        });
    });
});
