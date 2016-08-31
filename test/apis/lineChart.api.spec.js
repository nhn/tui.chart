/**
 * @fileoverview Test public APIs for line chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler');

describe('Test public APIs for bar chart', function() {
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

        lineChart = tui.chart.lineChart(container, rawData);
    });

    describe('addData()', function() {
        beforeEach(function() {
            spyOn(lineChart.dataProcessor, 'addDynamicData');
            spyOn(lineChart, '_startLookup');
        });

        it('add data', function() {
            lineChart.addData('category', [1, 2, 3]);

            expect(lineChart.dataProcessor.addDynamicData).toHaveBeenCalledWith('category', [1, 2, 3]);
            expect(lineChart._startLookup).toHaveBeenCalled();
        });

        it('add data, when coordinate data type', function() {
            lineChart.addData({
                legend1: 10,
                legend2: 5
            });

            expect(lineChart.dataProcessor.addDynamicData).toHaveBeenCalledWith(null, {
                legend1: 10,
                legend2: 5
            });
        });
    });

    describe('addPlotLine()', function() {
        it('add plot line', function() {
            var plot = lineChart.componentManager.get('plot');
            var addedPlotLine;

            lineChart.addPlotLine({
                value: '02/01/2016',
                color: 'red'
            });

            addedPlotLine = plot.optionalContainer.firstChild;

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(1);
            expect(addedPlotLine.className).toBe('tui-chart-plot-line vertical');
            expect(addedPlotLine.style.width).toBe('1px');
            expect(addedPlotLine.style.backgroundColor).toBe('red');
        });
    });

    describe('addPlotBand()', function() {
        it('add plot band', function() {
            var plot = lineChart.componentManager.get('plot');
            var addedPlotBand;

            lineChart.addPlotBand({
                range: ['03/01/2016', '04/01/2016'],
                color: 'yellow',
                opacity: 0.5
            });

            addedPlotBand = plot.optionalContainer.firstChild;

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(1);
            expect(addedPlotBand.className).toBe('tui-chart-plot-line vertical');
            expect(addedPlotBand.style.width).not.toBe('1px');
            expect(addedPlotBand.style.backgroundColor).toBe('yellow');
        });
    });

    describe('removePlotLine()', function() {
        it('remove plot line', function() {
            var plot = lineChart.componentManager.get('plot');

            lineChart.addPlotLine({
                id: 'line1',
                value: '02/01/2016',
                color: 'red'
            });

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(1);
            expect(plot.optionalContainer.firstChild.className).toBe('tui-chart-plot-line vertical');

            lineChart.removePlotLine('line1');

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(0);
        });
    });

    describe('removePlotBand()', function() {
        it('remove plot band', function() {
            var plot = lineChart.componentManager.get('plot');

            lineChart.addPlotBand({
                id: 'band1',
                range: ['03/01/2016', '04/01/2016'],
                color: 'yellow',
                opacity: 0.5
            });

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(1);
            expect(plot.optionalContainer.firstChild.className).toBe('tui-chart-plot-line vertical');

            lineChart.removePlotBand('band1');

            expect(plot.optionalContainer.className).toBe('tui-chart-plot-optional-lines-area');
            expect(plot.optionalContainer.childNodes.length).toBe(0);
        });
    });
});
