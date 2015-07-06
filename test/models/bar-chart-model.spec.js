/**
 * @fileoverview test bar chart model
 * @author jiung.kang@nhnent.com
 */

'use strict';

var BarChartModel = require('../../src/js/models/bar-chart-model.js');

describe('bar chart model', function() {
    var userData = [
            ['Element', 'Density'],
            ['Copper', 8.94],
            ['Silver', 10.49],
            ['Gold', 19.30],
            ['Platinum', 21.45]
        ],
        userData2 = [
            ['Element', 'Density', {role: 'style'}],
            ['Copper', 8.94, 'color:red'],
            ['Silver', 10.49, 'color:red'],
            ['Gold', 19.30, 'color:red'],
            ['Platinum', 21.45, 'color:red']
        ],
        userData3 = [
            ['Element', 'Density', 'Density2', 'Density3', {role: 'style'}]
        ],
        barChartModel = new BarChartModel();

    it('pickSeriesData', function() {
        var seriesData = barChartModel.pickSeriesData(userData);

        // removed title items
        expect(seriesData.length).toEqual(userData.length-1);
        expect(seriesData[0][0]).toEqual('Copper');

        seriesData = barChartModel.pickSeriesData(userData2);

        // removed title items
        expect(seriesData.length).toEqual(userData2.length-1);
        // removed 2d array last item of seriesData
        expect(seriesData[0].length).toEqual(2);
        // not removed 2d array last item of origin data
        expect(userData2[1].length).toEqual(3);
    });

    it('pickLabels', function() {
        var seriesData = barChartModel.pickSeriesData(userData),
            labels = barChartModel.pickLabels(seriesData);

        expect(labels.length).toEqual(seriesData.length);
        expect(labels[0]).toEqual(seriesData[0][0]);
    });

    it('pickValues', function() {
        var seriesData = barChartModel.pickSeriesData(userData),
            values = barChartModel.pickValues(seriesData);

        expect(values.length).toEqual(seriesData.length);
        expect(values[0][0]).toEqual(seriesData[0][1]);
    });

    it('pickLegendLabels', function() {
        var labels = barChartModel.pickLegendLabels(userData[0]);
        expect(labels).toEqual(['Density']);

        labels = barChartModel.pickLegendLabels(userData2[0]);
        expect(labels).toEqual(['Density']);

        labels = barChartModel.pickLegendLabels(userData3[0]);
        expect(labels).toEqual(['Density', 'Density2', 'Density3']);
    });

    it('setData', function() {
        barChartModel.setData(userData);
        expect(barChartModel.vAxis.axisType).toEqual('value');
        expect(barChartModel.hAxis.axisType).toEqual('label');
        expect(barChartModel.plot.hTickCount).toEqual(4);
        expect(barChartModel.legend.data[0]).toEqual(['Density', 'red']);
        expect(barChartModel.series.colorArr).toEqual(['red']);
    })
});