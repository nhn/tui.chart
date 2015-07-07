/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('../../src/js/models/chart-model.js'),
    chartConst = require('../../src/js/const.js');

describe('test chart model', function() {
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
        ];

    describe('test method', function() {
        var chartModel = new ChartModel();

        it('pickColor', function() {
            var colors = chartModel.pickColors(3),
                compareColors = Array.prototype.slice.call(chartConst.DEFAUlT_COLORS);

            compareColors.length = 3;
            expect(colors).toEqual(compareColors);
        });

        it('pickAxisData', function() {
            var seriesData = chartModel.pickAxisData(userData);

            // removed title items
            expect(seriesData.length).toEqual(userData.length-1);
            expect(seriesData[0][0]).toEqual('Copper');

            seriesData = chartModel.pickAxisData(userData2);

            // removed title items
            expect(seriesData.length).toEqual(userData2.length-1);
            // removed 2d array last item of seriesData
            expect(seriesData[0].length).toEqual(2);
            // not removed 2d array last item of origin data
            expect(userData2[1].length).toEqual(3);
        });

        it('pickLabels', function() {
            var seriesData = chartModel.pickAxisData(userData),
                labels = chartModel.pickLabels(seriesData);

            expect(labels.length).toEqual(seriesData.length);
            expect(labels[0]).toEqual(seriesData[0][0]);
        });

        it('pickValues', function() {
            var seriesData = chartModel.pickAxisData(userData),
                values = chartModel.pickValues(seriesData);

            expect(values.length).toEqual(seriesData.length);
            expect(values[0][0]).toEqual(seriesData[0][1]);
        });

        it('hasStyleOption', function() {
            var hasOption = chartModel.hasStyleOption(userData[0]);
            expect(hasOption).toBeFalsy();

            hasOption = chartModel.hasStyleOption(userData2[0]);
            expect(hasOption).toBeTruthy();
        });

        it('pickLegendLabels', function() {
            var labels = chartModel.pickLegendLabels(userData[0]);
            expect(labels).toEqual(['Density']);

            labels = chartModel.pickLegendLabels(userData2[0]);
            expect(labels).toEqual(['Density']);

            labels = chartModel.pickLegendLabels(userData3[0]);
            expect(labels).toEqual(['Density', 'Density2', 'Density3']);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var chartModel = new ChartModel(null, {
                    colors: ['black', 'white', 'gray']
                }),
                colors = chartModel.pickColors(2);
            expect(colors).toEqual(['black', 'white']);
        });
    });
});
