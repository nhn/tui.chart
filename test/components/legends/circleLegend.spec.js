/**
 * @fileoverview test circleLegend
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var circleLegendFactory = require('../../../src/js/components/legends/circleLegend');

describe('Test for CircleLegend', function() {
    var circleLegend, dataProcessor;

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFormatFunctions', 'getMaxValue', 'getFormattedMaxValue']);
        circleLegend = new circleLegendFactory.CircleLegend({
            dataProcessor: dataProcessor
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
});
