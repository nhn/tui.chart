/**
 * @fileoverview test legend model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var LegendModel = require('../../src/js/models/legendModel.js'),
    chartConst = require('../../src/js/const.js');

describe('test legend model', function() {
    var labels = [
            'Density',
            'Density2',
            'Density3',
            'Density4',
            'Density5'
        ],
        colors = Array.prototype.slice.call(chartConst.DEFAUlT_COLORS),
        data = {labels: labels, colors: colors};

    colors.length = labels.length;

    describe('test method', function() {
        it('setData', function() {
            var legendModel = new LegendModel(),
                result;

            legendModel._setData(data);

            expect(ne.util.pluck(legendModel.data, 0)).toEqual(labels);
            expect(ne.util.pluck(legendModel.data, 1)).toEqual(colors);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var legendModel = new LegendModel(data);

            expect(ne.util.pluck(legendModel.data, 0)).toEqual(labels);
            expect(ne.util.pluck(legendModel.data, 1)).toEqual(colors);
        });
    });
});
