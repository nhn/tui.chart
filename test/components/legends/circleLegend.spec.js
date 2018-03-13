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
        it('should convert float to number, when decimal place set to 0', function() {
            var actual, expected;

            dataProcessor.getFormatFunctions.and.returnValue([]);
            actual = circleLegend._formatLabel(10.22, 0);
            expected = '10';

            expect(actual).toBe(expected);
        });

        it('should set decimal places to passed number', function() {
            var actual, expected;

            dataProcessor.getFormatFunctions.and.returnValue([]);
            actual = circleLegend._formatLabel(10.223, 2);
            expected = '10.22';

            expect(actual).toBe(expected);
        });

        it('should format labels by formatFunctions, when formatFunctions exist', function() {
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
