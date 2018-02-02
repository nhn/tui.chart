/**
 * @fileoverview Test user events for line chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler');
var comboChartFactory = require('../../src/js/index').comboChart;

describe('Test user events for combo chart', function() {
    var rawData = {
        categories: ['Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct'],
        series: {
            column: [
                {
                    name: 'Seoul',
                    data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9]
                },
                {
                    name: 'NewYork',
                    data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3]

                },

                {
                    name: 'Sydney',
                    data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6]
                },
                {
                    name: 'Moskva',
                    data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2]
                }
            ],
            line: [
                {
                    name: 'Average',
                    data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3]
                }
            ]
        }
    };
    var comboChart;
    var container;

    beforeEach(function() {
        container = dom.create('DIV');

        dom.append(document.body, container);

        comboChart = comboChartFactory(container, rawData, {
            series: {
                allowSelect: true
            },
            tooltip: {
                grouped: true
            }
        });
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe('selectSeries', function() {
        it('select series', function(done) {
            var mouseEventDetector = comboChart.componentManager.get('mouseEventDetector');

            comboChart.on('selectSeries', function(info) {
                expect(info.chartType).toBe('column');
                expect(info.legend).toBe('Sydney');
                expect(info.legendIndex).toBe(2);
                expect(info.index).toBe(1);

                done();
            });

            mouseEventDetector._onClick({ // (May - Sydney)
                clientX: 123, // Index2: 123 ~ 129
                clientY: 376 // Index2: 209 ~ 376
            });
        });
    });

    describe('unselectSeries', function() {
        it('unselect series', function(done) {
            var mouseEventDetector = comboChart.componentManager.get('mouseEventDetector');

            comboChart.on('unselectSeries', function(info) {
                expect(info.chartType).toBe('column');
                expect(info.legend).toBe('Sydney');
                expect(info.legendIndex).toBe(2);
                expect(info.index).toBe(1);

                done();
            });

            // select
            mouseEventDetector._onClick({
                clientX: 123,
                clientY: 330
            });

            setTimeout(function() {
                // unselect
                mouseEventDetector._onClick({
                    clientX: 123,
                    clientY: 330
                });
            });
        });
    });

    // if group tooltip
    describe('beforeShowTooltip', function() {
        it('before show tooltip', function(done) {
            var mouseEventDetector = comboChart.componentManager.get('mouseEventDetector');

            comboChart.on('beforeShowTooltip', function(info) {
                expect(info.chartType).toBe('combo');
                expect(info.index).toBe(1);
                expect(info.range.start).toBeDefined();
                expect(info.range.end).toBeDefined();

                done();
            });

            mouseEventDetector._onMousemove({
                clientX: 96, // index 1: 95 ~ 137
                clientY: 100
            });
        });
    });

    describe('afterShowTooltip', function() {
        it('after show tooltip', function(done) {
            var mouseEventDetector = comboChart.componentManager.get('mouseEventDetector');

            comboChart.on('afterShowTooltip', function(info) {
                expect(info.chartType).toBe('combo');
                expect(info.index).toBe(1);
                expect(info.range.start).toBeDefined();
                expect(info.range.end).toBeDefined();
                expect(info.element).toBeDefined();
                expect(info.position.left).toBeDefined(true);
                expect(info.position.top).toBeDefined(true);

                done();
            });

            mouseEventDetector._onMousemove({
                clientX: 96, // index 1: 95 ~ 137
                clientY: 100
            });
        });
    });
});
