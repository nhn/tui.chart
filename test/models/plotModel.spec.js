/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PlotModel = require('../../src/js/models/plotModel.js');

describe('test plot model', function() {
    var vTickCount = 5,
        hTickCount = 6;

    describe('test method', function() {
        var plotModel;

        beforeEach(function() {
            plotModel = new PlotModel();
        });

        it('setData', function() {
            plotModel._setData({vTickCount: vTickCount, hTickCount: hTickCount});
            expect(plotModel.vTickCount).toEqual(vTickCount);
            expect(plotModel.hTickCount).toEqual(hTickCount);

            plotModel._setData({vTickCount: vTickCount});
            expect(plotModel.vTickCount).toEqual(vTickCount);
            expect(plotModel.hTickCount).toEqual(0);

            plotModel._setData({hTickCount: hTickCount});
            expect(plotModel.vTickCount).toEqual(0);
            expect(plotModel.hTickCount).toEqual(hTickCount);
        });

        it('makeVPixelPositions', function() {
            var positions;
            plotModel._setData({vTickCount: 5});
            positions = plotModel.makeVPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);

            plotModel._setData({hTickCount: 5});
            positions = plotModel.makeVPixelPositions(200);
            expect(positions).toEqual([]);
        });

        it('makeHPixelPositions', function() {
            var positions;

            plotModel._setData({vTickCount: 5});
            positions = plotModel.makeHPixelPositions(200);
            expect(positions).toEqual([]);

            plotModel._setData({hTickCount: 5});
            positions = plotModel.makeHPixelPositions(200);
            expect(positions).toEqual([50, 100, 149, 199]);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {vTickCount: vTickCount, hTickCount: hTickCount},
                plotModel = new PlotModel(data);

            expect(plotModel.vTickCount).toEqual(vTickCount);
            expect(plotModel.hTickCount).toEqual(hTickCount);
        });
    });
});
