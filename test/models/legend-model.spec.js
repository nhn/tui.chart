/**
 * @fileoverview test legend model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendModel = require('../../src/js/models/legend-model.js');

describe('test legend model', function() {
    var labels = [
            'Element',
            'Copper',
            'Silver',
            'Gold',
            'Platinum'
        ],
        colors = [
            'red',
            'orange',
            'yellow',
            'green',
            'blue'
        ];

    describe('test method', function() {
        it('setData', function() {
            var legendModel = new LegendModel();

            legendModel.setData({labels: labels, colors: colors});
            var data = legendModel.getData();

            expect(legendModel.pluck(data, 0).join(',')).toEqual(labels.join(','));
            expect(legendModel.pluck(data, 1).join(',')).toEqual(colors.join(','));
        });
    });

    describe('test initialize', function() {
        it('init', function() {
            var options = {
                    data: {labels: labels, colors: colors}
                },
                legendModel = new LegendModel(options),
                data = legendModel.getData();

            expect(legendModel.pluck(data, 0).join(',')).toEqual(labels.join(','));
            expect(legendModel.pluck(data, 1).join(',')).toEqual(colors.join(','));
        });
    });
});
