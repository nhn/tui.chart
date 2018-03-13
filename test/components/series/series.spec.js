/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('../../../src/js/components/series/series');
var chartConst = require('../../../src/js/const');
var dom = require('../../../src/js/helpers/domHandler');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var snippet = require('tui-code-snippet');

describe('Series', function() {
    var series;

    beforeEach(function() {
        series = new Series({
            chartType: 'bar',
            tooltipPrefix: 'tooltip-prefix-',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11,
                    fontWeight: 'normal'
                },
                colors: ['blue']
            },
            options: {},
            eventBus: new snippet.CustomEvents()
        });
    });

    describe('_getLimitDistanceFromZeroPoint()', function() {
        it('should calculate limit distance from zero, if 0 is between min, max value.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: -20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 80,
                toMin: 20
            });
        });

        it('should set {toMax: size, toMin: 0}, if min, max are positive number.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: 20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 100,
                toMin: 0
            });
        });

        it('should set {toMax: 0, toMin: 0}, if min, max are negative number.', function() {
            var result = series._getLimitDistanceFromZeroPoint(100, {
                min: -80,
                max: -20
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });
    });

    describe('renderBounds()', function() {
        it('should render position of series area.', function() {
            var seriesContainer = dom.create('DIV');

            spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);

            series._renderPosition(seriesContainer, {
                top: 20,
                left: 20
            });

            expect(seriesContainer.style.top).toBe('20px');
            expect(seriesContainer.style.left).toBe('20px');
        });
    });

    describe('_findLabelElement()', function() {
        it('should return target element if target is series label element.', function() {
            var elTarget = dom.create('DIV', chartConst.CLASS_NAME_SERIES_LABEL);
            var actual = series._findLabelElement(elTarget);
            var expected = elTarget;

            expect(actual).toBe(expected);
        });
    });
});
