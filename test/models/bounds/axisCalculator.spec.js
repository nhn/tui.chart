/**
 * @fileoverview Test for axisCalculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var axisCalculator = require('../../../src/js/models/bounds/axisCalculator');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for axisCalculator', function() {
    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('calculateXAxisHeight()', function() {
        it('calculate height for x axis', function() {
            var actual = axisCalculator.calculateXAxisHeight({title: 'Axis Title'}, {});

            expect(actual).toBe(52);
        });

        it('labelMargin option should increase the x-axis height.', function() {
            var actual = axisCalculator.calculateXAxisHeight({title: 'Axis Title', labelMargin: 30}, {});
            expect(actual).toBe(82);
        });

        it('showlabel option is false, it should be reflected in the width of the label width', function() {
            var actual = axisCalculator.calculateXAxisHeight({title: 'Axis Title', showLabel: false}, {});
            expect(actual).toBe(32);
        });
    });

    describe('calculateYAxisWidth()', function() {
        it('calculate width for y axis', function() {
            var actual;

            actual = axisCalculator.calculateYAxisWidth(['label1', 'label12'], {
                title: 'Axis Title'
            }, {}, []);

            expect(actual).toBe(67);
        });

        it('calculate width for y axis, when isCenter option is true', function() {
            var actual;

            actual = axisCalculator.calculateYAxisWidth(['label1', 'label12'], {
                title: 'Axis Title',
                isCenter: true
            }, {}, []);

            expect(actual).toBe(84);
        });

        it('labelMargin option should increase the y-axis width.', function() {
            var actual;

            actual = axisCalculator.calculateYAxisWidth(['label1', 'label12'], {
                title: 'Axis Title',
                labelMargin: 30
            }, {}, []);

            expect(actual).toBe(97);
        });

        it('showlabel option is false, it should be reflected in the width of the label width', function() {
            var actual;
            actual = axisCalculator.calculateYAxisWidth(['label1', 'label12'], {
                title: 'Axis Title',
                showLabel: false
            }, {}, []);

            expect(actual).toBe(17);
        });
    });
});
