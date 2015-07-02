/**
 * @fileoverview test plot model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var PlotModel = require('../../src/js/models/plot-model.js');

describe('test plot model', function() {
    var vTickCount = 5,
        hTickCount = 6;

    describe('test method', function() {
        it('setData', function() {
            var plotModel = new PlotModel();

            plotModel.setData({vTickCount: vTickCount, hTickCount: hTickCount});
            expect(plotModel.getVTickCount()).toEqual(vTickCount);
            expect(plotModel.getHTickCount()).toEqual(hTickCount);

            plotModel.setData({vTickCount: vTickCount});
            expect(plotModel.getVTickCount()).toEqual(vTickCount);
            expect(plotModel.getHTickCount()).toEqual(0);

            plotModel.setData({hTickCount: hTickCount});
            expect(plotModel.getVTickCount()).toEqual(0);
            expect(plotModel.getHTickCount()).toEqual(hTickCount);
        });
    });

    describe('test initialize', function() {
        it('init', function() {
            var options = {
                    data: {vTickCount: vTickCount, hTickCount: hTickCount}
                },
                plotModel = new PlotModel(options);

            expect(plotModel.getVTickCount()).toEqual(vTickCount);
            expect(plotModel.getHTickCount()).toEqual(hTickCount);
        });
    });
});
