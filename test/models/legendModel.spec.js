/**
 * @fileoverview test legend model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LegendModel = require('../../src/js/models/legendModel.js');

describe('test legend model', function() {
    var labels = [
            'Density',
            'Density2',
            'Density3',
            'Density4',
            'Density5'
        ],
        data = {labels: labels};

    describe('test method', function() {
        it('setData', function() {
            var legendModel = new LegendModel();

            legendModel._setData(data);

            expect(legendModel.labels).toEqual(labels);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var legendModel = new LegendModel(data);

            expect(legendModel.labels).toEqual(labels);
        });
    });
});
