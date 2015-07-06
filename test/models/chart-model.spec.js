/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var ChartModel = require('../../src/js/models/chart-model.js');

describe('test chart model', function() {;
    describe('test method', function() {
        it('pickColor', function() {
            var plotModel = new ChartModel();

            var colors = plotModel.pickColors(3);
            expect(colors).toEqual(['red', 'orange', 'yellow']);
        });
    });
});
