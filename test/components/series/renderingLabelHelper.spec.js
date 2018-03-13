/**
 * @fileoverview Test for renderingLabelHelper.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var labelHelper = require('../../../src/js/components/series/renderingLabelHelper');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var snippet = require('tui-code-snippet');

describe('Test for renderingLabelHelper', function() {
    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_calculateLeftPositionForCenterAlign()', function() {
        it('should calculate left position for center alignment.', function() {
            var bound = {
                left: 50,
                width: 40
            };
            var actual = labelHelper._calculateLeftPositionForCenterAlign(bound, 60);

            expect(actual).toBe(70);
        });
    });

    describe('_calculateTopPositionForMiddleAlign()', function() {
        it('should calculate top position for middle alignment.', function() {
            var bound = {
                top: 50,
                height: 40
            };
            var actual = labelHelper._calculateTopPositionForMiddleAlign(bound, 60);

            expect(actual).toBe(70);
        });
    });

    describe('_makePositionForBoundType()', function() {
        it('should calculate position of bound type chart.', function() {
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var actual = labelHelper._makePositionForBoundType(bound, 20, 'label');

            expect(actual.left).toBe(50);
            expect(actual.top).toBe(45);
        });
    });

    describe('_makePositionMap()', function() {
        it('should make position map having only an end property, if it is not range value.', function() {
            var seriesItem = {
                value: 10
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = snippet.bind(labelHelper._makePositionForBoundType, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 50,
                top: 45
            });
            expect(actual.start).toBeUndefined();
        });

        it('should make position map having start, end property, if it is range value.', function() {
            var seriesItem = {
                value: 10,
                isRange: true
            };
            var bound = {
                left: 30,
                top: 20,
                width: 40,
                height: 50
            };
            var makePosition = snippet.bind(labelHelper._makePositionForBarChart, labelHelper);
            var actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

            expect(actual.end).toEqual({
                left: 75,
                top: 45
            });
            expect(actual.start).toEqual({
                left: -25,
                top: 45
            });
        });
    });
});
