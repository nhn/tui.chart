/**
 * @fileoverview test base model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var Model = require('../../src/js/models/model.js');

describe('test axis model', function() {

    var model;

    beforeEach(function() {
        model = new Model();
    });
    it('getScaleStep', function() {
        var tickCount = 5,
            scale = {min: 20, max: 100},
            step = model.getScaleStep(scale, tickCount);
        expect(step).toEqual(20);
    });

    it('makePixelPositions', function() {
        var positions = model.makePixelPositions(300, 5);
        expect(positions).toEqual([0, 75, 150, 224, 299]);
    });
});