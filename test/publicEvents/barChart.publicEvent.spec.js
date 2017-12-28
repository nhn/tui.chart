/**
 * @fileoverview Test user events for bar chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler');
var barChartFactory = require('../../src/js/index').barChart;

describe('Test user events for bar chart', function() {
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

        barChart = barChartFactory(container, rawData, {
            series: {
                allowSelect: true
            }
        });
    });

    describe('selectSeries', function() {
        it('select series', function(done) {
            var mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 40,
                top: 70,
                right: 460,
                bottom: 390
            });

            barChart.on('selectSeries', function(info) {
                expect(info.chartType).toBe('bar');
                expect(info.legend).toBe('Income');
                expect(info.legendIndex).toBe(1);
                expect(info.index).toBe(0);

                done();
            });

            mouseEventDetector._onClick({
                clientX: 100,
                clientY: 100
            });
        });
    });

    describe('unselectSeries', function() {
        it('unselect series', function(done) {
            var mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 40,
                top: 70,
                right: 460,
                bottom: 390
            });

            barChart.on('unselectSeries', function(info) {
                expect(info.chartType).toBe('bar');
                expect(info.legend).toBe('Income');
                expect(info.legendIndex).toBe(1);
                expect(info.index).toBe(0);

                done();
            });

            // select
            mouseEventDetector._onClick({
                clientX: 100,
                clientY: 100
            });

            setTimeout(function() {
                // unselect
                mouseEventDetector._onClick({
                    clientX: 100,
                    clientY: 100
                });
            });
        });
    });

    describe('selectLegend', function() {
        it('select legend', function(done) {
            var legend = barChart.componentManager.get('legend');

            barChart.on('selectLegend', function(info) {
                expect(info).toEqual({
                    chartType: 'bar',
                    legend: 'Expenses',
                    index: 2
                });

                done();
            });

            legend._selectLegend(2);
        });
    });

    describe('beforeShowTooltip', function() {
        it('before show tooltip', function(done) {
            var mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 40,
                top: 70,
                right: 460,
                bottom: 390
            });

            barChart.on('beforeShowTooltip', function(info) {
                expect(info.chartType).toBe('bar');
                expect(info.legend).toBe('Income');
                expect(info.legendIndex).toBe(1);
                expect(info.index).toBe(0);

                done();
            });

            mouseEventDetector._onMousemove({
                clientX: 100,
                clientY: 100
            });
        });
    });

    describe('afterShowTooltip', function() {
        it('after show tooltip', function(done) {
            var mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 40,
                top: 70,
                right: 460,
                bottom: 390
            });

            barChart.on('afterShowTooltip', function(info) {
                expect(info.chartType).toBe('bar');
                expect(info.legend).toBe('Income');
                expect(info.legendIndex).toBe(1);
                expect(info.index).toBe(0);
                expect(info.element).toBeDefined();
                expect(info.position.left).toBeDefined(true);
                expect(info.position.top).toBeDefined(true);

                done();
            });

            mouseEventDetector._onMousemove({
                clientX: 100,
                clientY: 100
            });
        });
    });
});
