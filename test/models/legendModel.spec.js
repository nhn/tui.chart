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
        colors = Array.prototype.slice.call(chartConst.DEFAUlT_COLORS);
    colors.length = labels.length;

    describe('test method', function() {
        it('setData', function() {
            var legendModel = new LegendModel();

            legendModel._setData({labels: labels, colors: colors});
            var data = legendModel.getData();

            expect(ne.util.pluck(data, 0).join(',')).toEqual(labels.join(','));
            expect(ne.util.pluck(data, 1).join(',')).toEqual(colors.join(','));
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {labels: labels, colors: colors},
                legendModel = new LegendModel(data),
                data = legendModel.getData();

            expect(ne.util.pluck(data, 0).join(',')).toEqual(labels.join(','));
            expect(ne.util.pluck(data, 1).join(',')).toEqual(colors.join(','));
        });
    });
});
