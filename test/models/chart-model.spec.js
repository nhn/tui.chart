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
        ],
        axisData = [
            ['Copper', 8.94],
            ['Silver', 10.49],
            ['Gold', 19.30],
            ['Platinum', 21.45]
        ];

    describe('test method', function() {
        var chartModel = new ChartModel();

        it('pickColor', function() {
            var colors = chartModel._pickColors(3),
                compareColors = chartConst.DEFAUlT_COLORS.slice();

            compareColors.length = 3;
            expect(colors).toEqual(compareColors);
        });

        it('_pickAxisData', function() {
            var result = chartModel._pickAxisData(userData);

            // removed title items
            expect(result.length).toEqual(userData.length-1);
            expect(result).toEqual(axisData);

            result = chartModel._pickAxisData(userData2);

            // removed title items
            expect(result.length).toEqual(userData2.length-1);
            expect(result).toEqual(axisData);
        });

        it('_pickLabels', function() {
            var result = chartModel._pickLabels(axisData);

            expect(result.length).toEqual(axisData.length);
            expect(result).toEqual(['Copper', 'Silver', 'Gold', 'Platinum']);
        });

        it('_pickValues', function() {
            var result = chartModel._pickValues(axisData);

            expect(result.length).toEqual(axisData.length);
            expect(result).toEqual([[8.94], [10.49], [19.30], [21.45]]);
        });

        it('_hasStyleOption', function() {
            var hasOption = chartModel._hasStyleOption(userData[0]);
            expect(hasOption).toBeFalsy();

            hasOption = chartModel._hasStyleOption(userData2[0]);
            expect(hasOption).toBeTruthy();
        });

        it('_pickLegendLabels', function() {
            var labels = chartModel._pickLegendLabels(userData[0]);
            expect(labels).toEqual(['Density']);

            labels = chartModel._pickLegendLabels(userData2[0]);
            expect(labels).toEqual(['Density']);

            labels = chartModel._pickLegendLabels(userData3[0]);
            expect(labels).toEqual(['Density', 'Density2', 'Density3']);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var chartModel = new ChartModel(null, {
                    colors: ['black', 'white', 'gray']
                }),
                colors = chartModel._pickColors(2);
            expect(colors).toEqual(['black', 'white']);
        });
    });
});
