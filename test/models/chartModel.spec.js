/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
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
        userData3 = [
            ['Element', 'Density', 'Density2', 'Density3']
        ],
        axisData = [
            ['Copper', 8.94],
            ['Silver', 10.49],
            ['Gold', 19.30],
            ['Platinum', 21.45]
        ];

    describe('test method', function() {
        var chartModel = new ChartModel();

        it('pickValues', function() {
            var result = chartModel.pickValues(axisData);
            expect(result).toEqual([[8.94, 10.49, 19.30, 21.45]]);
        });

        it('pickLegendLabels', function() {
            var labels = chartModel.pickLegendLabels(axisData);
            expect(labels).toEqual(['Copper', 'Silver', 'Gold', 'Platinum']);
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
