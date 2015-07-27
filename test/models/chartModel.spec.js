/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('../../src/js/models/chartModel.js');

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
            ['Silver', 10.49, 'color:orange'],
            ['Gold', 19.30, 'color:yellow'],
            ['Platinum', 21.45, 'color:green']
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

        it('pickAxisData', function() {
            var result = chartModel.pickAxisData(userData);

            // removed title items
            expect(result.length).toEqual(userData.length-1);
            expect(result).toEqual(axisData);

            result = chartModel.pickAxisData(userData2);

            // removed title items
            expect(result.length).toEqual(userData2.length-1);
            expect(result).toEqual(axisData);
        });

        it('pickLabels', function() {
            var result = chartModel.pickLabels(axisData);

            expect(result.length).toEqual(axisData.length);
            expect(result).toEqual(['Copper', 'Silver', 'Gold', 'Platinum']);
        });

        it('pickValues', function() {
            var result = chartModel.pickValues(axisData);

            expect(result.length).toEqual(axisData.length);
            expect(result).toEqual([[8.94], [10.49], [19.30], [21.45]]);
        });

        it('_pickStyles', function() {
            var result = chartModel.pickLastItemStyles(userData2);
            expect(result).toEqual([{color: 'red'}, {color: 'orange'}, {color: 'yellow'}, {color: 'green'}]);
        });

        it('_hasStyleOption', function() {
            var hasOption = chartModel._hasStyleOption(userData[0]);
            expect(hasOption).toBeFalsy();

            hasOption = chartModel._hasStyleOption(userData2[0]);
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
                chart: {
                    title: 'chat title'
                }
            });
            expect(chartModel.title).toEqual('chat title');

            try {
                chartModel._setData();
            } catch (e) {
                expect(e.message).toEqual('Please implement the setData.');
            }
        });
    });
});
