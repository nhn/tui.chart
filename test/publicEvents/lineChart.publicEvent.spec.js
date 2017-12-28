/**
 * @fileoverview Test user events for line chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler');
var lineChartFactory = require('../../src/js/index').lineChart;

describe('Test user events for line chart', function() {
    var rawData = {
        categories: ['01/01/2016', '02/01/2016', '03/01/2016', '04/01/2016', '05/01/2016', '06/01/2016', '07/01/2016', '08/01/2016', '09/01/2016', '10/01/2016', '11/01/2016', '12/01/2016'],
        series: [
            {
                name: 'Seoul',
                data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6]
            },
            {
                name: 'Seattle',
                data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7]
            },
            {
                name: 'Sydney',
                data: [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2]
            },
            {
                name: 'Moskva',
                data: [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5]
            },
            {
                name: 'Jungfrau',
                data: [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9]
            }
        ]
    };
    var lineChart;

    beforeEach(function() {
        var container = dom.create('DIV');

        lineChart = lineChartFactory(container, rawData, {
            series: {
                allowSelect: true
            }
        });
    });

    describe('selectSeries', function() {
        it('select series', function(done) {
            var mouseEventDetector = lineChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                top: 80,
                right: 450,
                bottom: 380
            });

            lineChart.on('selectSeries', function(info) {
                expect(info.chartType).toBe('line');
                expect(info.legend).toBe('Sydney');
                expect(info.legendIndex).toBe(2);
                expect(info.index).toBe(0);
                done();
            });

            mouseEventDetector._onClick({
                clientX: 50,
                clientY: 100
            });
        });
    });

    describe('unselectSeries', function() {
        it('unselect series', function(done) {
            var mouseEventDetector = lineChart.componentManager.get('mouseEventDetector');

            mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
            mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                top: 80,
                right: 450,
                bottom: 380
            });

            lineChart.on('unselectSeries', function(info) {
                expect(info.chartType).toBe('line');
                expect(info.legend).toBe('Sydney');
                expect(info.legendIndex).toBe(2);
                expect(info.index).toBe(0);

                done();
            });

            // select
            mouseEventDetector._onClick({
                clientX: 50,
                clientY: 100
            });

            setTimeout(function() {
                // unselect
                mouseEventDetector._onClick({
                    clientX: 65,
                    clientY: 200
                });
            });
        });
    });
});
