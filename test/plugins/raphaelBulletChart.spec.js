/**
 * @fileoverview Test for RaphaelBulletChart.
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelBulletChart = require('../../src/js/plugins/raphaelBulletChart');
var raphael = require('raphael');

describe('RaphaelBulletChart', function() {
    var bound = {top: 10, left: 20, width: 0, height: 40};
    var paperContainer = document.createElement('DIV');
    var bulletChart, seriesColor;

    beforeEach(function() {
        bulletChart = new RaphaelBulletChart();
        bulletChart.theme = {
            colors: ['yellow', 'red'],
            ranges: []
        };
        bulletChart.paper = raphael(paperContainer, 100, 100);
        seriesColor = 'yellow';
    });

    describe('_getRangeOpacity()', function() {
        it('should create object and put calculated opacity, when rangesOpacities is undefined', function() {
            bulletChart.maxRangeCount = 3;
            expect(bulletChart.rangeOpacities).toBeUndefined();

            bulletChart._getRangeOpacity(0);
            expect(bulletChart.rangeOpacities instanceof Object).toBe(true);
            expect(bulletChart.rangeOpacities[0]).toBe(0.75);
        });

        it('should store range opacities in object', function() {
            bulletChart.maxRangeCount = 3;
            expect(bulletChart.rangeOpacities).toBeUndefined();

            bulletChart._getRangeOpacity(1);
            bulletChart._getRangeOpacity(2);
            expect(bulletChart.rangeOpacities[0]).toBeUndefined();
            expect(bulletChart.rangeOpacities[1]).toBe(0.5);
            expect(bulletChart.rangeOpacities[2]).toBe(0.25);
        });

        it('should not store range opacity, when index is larger or same than max ranges count', function() {
            bulletChart.maxRangeCount = 3;
            bulletChart._getRangeOpacity(3);
            expect(bulletChart.rangeOpacities[3]).toBeUndefined();
        });

        it('should update opacity step, when maxRangeCount is changed', function() {
            spyOn(bulletChart, '_updateOpacityStep');
            bulletChart._updateOpacityStep.and.callThrough();

            bulletChart.maxRangeCount = 3;
            bulletChart._getRangeOpacity(0);
            bulletChart._getRangeOpacity(0);
            expect(bulletChart._updateOpacityStep.calls.count()).toBe(1);
        });

        it('should not update opacity step, when maxRangeCount is not changed', function() {
            spyOn(bulletChart, '_updateOpacityStep');
            bulletChart._updateOpacityStep.and.callThrough();

            bulletChart.maxRangeCount = 3;
            bulletChart._getRangeOpacity(0);
            bulletChart.maxRangeCount = 5;
            bulletChart._getRangeOpacity(0);
            expect(bulletChart._updateOpacityStep.calls.count()).toBe(2);
        });
    });

    describe('_updateOpacityStep()', function() {
        it('should reset range opacities', function() {
            bulletChart.rangeOpacities = {0: 0.75};
            bulletChart._updateOpacityStep(3);

            expect(bulletChart.rangeOpacities).toEqual({});
        });

        it('should update opacity step by maxRanges count', function() {
            bulletChart._updateOpacityStep(3);

            expect(bulletChart.opacityStep).toBe('0.25');
            expect(bulletChart.prevMaxRangeCount).toBe(3);
        });
    });

    describe('_renderActual()', function() {
        it('should render a actual bar', function() {
            var rectElement, svgRect;
            document.body.appendChild(paperContainer);
            rectElement = bulletChart._renderActual(bound, seriesColor);
            svgRect = rectElement.getBBox();

            expect(rectElement.attrs.fill).toBe('yellow');
            expect(svgRect.x).toBe(20);
            expect(svgRect.y).toBe(10);
            expect(svgRect.width).toBe(0);
            expect(svgRect.height).toBe(40);

            document.body.removeChild(paperContainer);
        });
    });

    describe('_renderRange()', function() {
        beforeEach(function() {
            bulletChart.maxRangeCount = 1;
        });

        it('should render range bar at bound position', function() {
            var rectElement, svgRect;
            document.body.appendChild(paperContainer);
            rectElement = bulletChart._renderRange(bound, seriesColor, 0, null);
            svgRect = rectElement.getBBox();

            expect(svgRect.x).toBe(20);
            expect(svgRect.y).toBe(10);
            expect(svgRect.width).toBe(0);
            expect(svgRect.height).toBe(40);

            document.body.removeChild(paperContainer);
        });

        it('should set color and opacity, if there is not costom theme', function() {
            var rangeElement = bulletChart._renderRange(bound, seriesColor, 0, null);

            expect(rangeElement.attrs.fill).toBe('yellow');
            expect(rangeElement.attrs.opacity).toBe(0.5);
        });

        it('should fill color if there is color value in costom theme', function() {
            var rangeTheme = {color: '#00ff00'};
            var rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

            expect(rangeElement.attrs.fill).toBe('#00ff00');
            expect(rangeElement.attrs.opacity).toBe(0.5);
        });

        it('should fill opacity if there is opacity value in costom theme', function() {
            var rangeTheme = {opacity: 0.75};
            var rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

            expect(rangeElement.attrs.fill).toBe('yellow');
            expect(rangeElement.attrs.opacity).toBe(0.75);
        });

        it('should fill color and opacity if there are color and opacity in costom theme', function() {
            var rangeTheme = {color: '#00ff00', opacity: 0.75};
            var rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

            expect(rangeElement.attrs.fill).toBe('#00ff00');
            expect(rangeElement.attrs.opacity).toBe(0.75);
        });
    });
});
