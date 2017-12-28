/**
 * @fileoverview Test public APIs for bar chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler');
var barChartFactory = require('../../src/js/index').barChart;

describe('Test public APIs for bar chart', function() {
    var rawData = {
        categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
        series: [
            {
                name: 'Budget',
                data: [5000, 3000, 5000, 7000, 6000, 4000]
            },
            {
                name: 'Income',
                data: [8000, 1000, 7000, 2000, 5000, 3000]

            },
            {
                name: 'Expenses',
                data: [4000, 4000, 6000, 3000, 4000, 5000]
            },
            {
                name: 'Debt',
                data: [6000, 3000, 3000, 1000, 2000, 4000]
            }
        ]
    };
    var barChart;

    beforeEach(function() {
        var container = dom.create('DIV');

        barChart = barChartFactory(container, rawData, {});
    });

    describe('resize()', function() {
        it('resize width', function() {
            expect(barChart.chartContainer.style.width).toBe('500px');

            barChart.resize({
                width: 800
            });

            expect(barChart.chartContainer.style.width).toBe('800px');
        });

        it('resize width, when width is minus value', function() {
            expect(barChart.chartContainer.style.width).toBe('500px');

            barChart.resize({
                width: -800
            });

            expect(barChart.chartContainer.style.width).toBe('500px');
        });

        it('resize height', function() {
            expect(barChart.chartContainer.style.height).toBe('400px');

            barChart.resize({
                height: 700
            });

            expect(barChart.chartContainer.style.height).toBe('700px');
        });

        it('resize height, when height is minus value', function() {
            expect(barChart.chartContainer.style.height).toBe('400px');

            barChart.resize({
                height: -700
            });

            expect(barChart.chartContainer.style.height).toBe('400px');
        });

        it('resize width and height', function() {
            barChart.resize({
                width: 400,
                height: 300
            });

            expect(barChart.chartContainer.style.width).toBe('400px');
            expect(barChart.chartContainer.style.height).toBe('300px');
        });
    });

    describe('setTooltipAlign()', function() {
        it('set align option for tooltip', function() {
            expect(barChart.options.tooltip.align).toBe('right middle');

            barChart.setTooltipAlign('center top');

            expect(barChart.options.tooltip.align).toBe('center top');
        });
    });

    describe('setTooltipOffset()', function() {
        it('set offset option for tooltip', function() {
            expect(barChart.options.tooltip.offset).toBeUndefined();

            barChart.setTooltipOffset({
                x: 10,
                y: 20
            });

            expect(barChart.options.tooltip.offset.x).toBe(10);
            expect(barChart.options.tooltip.offset.y).toBe(20);
        });

        it('set offset option for tooltip, when parameters have only x value', function() {
            expect(barChart.options.tooltip.offset).toBeUndefined();

            barChart.setTooltipOffset({
                x: 10
            });

            expect(barChart.options.tooltip.offset.x).toBe(10);
            expect(barChart.options.tooltip.offset.y).toBeUndefined();
        });

        it('set offset option for tooltip, when parameters have only y value', function() {
            expect(barChart.options.tooltip.offset).toBeUndefined();

            barChart.setTooltipOffset({
                y: 10
            });

            expect(barChart.options.tooltip.offset.x).toBeUndefined();
            expect(barChart.options.tooltip.offset.y).toBe(10);
        });
    });

    describe('resetTooltipAlign()', function() {
        it('reset align option for tooltip', function() {
            var container = dom.create('DIV');

            barChart = barChartFactory(container, rawData, {
                tooltip: {
                    align: 'left bottom'
                }
            });

            expect(barChart.options.tooltip.align).toBe('left bottom');

            barChart.setTooltipAlign('center top');

            expect(barChart.options.tooltip.align).toBe('center top');

            barChart.resetTooltipAlign();

            expect(barChart.options.tooltip.align).toBe('left bottom');
        });
    });

    describe('resetTooltipOffset()', function() {
        it('reset offset option for tooltip', function() {
            var container = dom.create('DIV');

            barChart = barChartFactory(container, rawData, {
                tooltip: {
                    offsetX: 10,
                    offsetY: 20
                }
            });

            expect(barChart.options.tooltip.offset.x).toBe(10);
            expect(barChart.options.tooltip.offset.y).toBe(20);

            barChart.setTooltipOffset({
                x: 30,
                y: 40
            });

            expect(barChart.options.tooltip.offset.x).toBe(30);
            expect(barChart.options.tooltip.offset.y).toBe(40);

            barChart.resetTooltipOffset();

            expect(barChart.options.tooltip.offset.x).toBe(10);
            expect(barChart.options.tooltip.offset.y).toBe(20);
        });
    });

    describe('showSeriesLabel()', function() {
        it('show series label', function() {
            var series = barChart.componentManager.get('barSeries');

            expect(barChart.options.series.showLabel).toBeUndefined();
            expect(series.seriesLabelContainer).toBeNull();

            barChart.showSeriesLabel();

            expect(barChart.options.series.showLabel).toBe(true);
        });
    });

    describe('hideSeriesLabel()', function() {
        it('hide series label', function() {
            expect(barChart.options.series.showLabel).toBeUndefined();

            barChart.showSeriesLabel();

            expect(barChart.options.series.showLabel).toBe(true);

            barChart.hideSeriesLabel();

            expect(barChart.options.series.showLabel).toBe(false);
        });
    });
});
