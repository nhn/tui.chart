/**
 * @fileoverview test radial plot
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var radialPlotFactory = require('../../../src/js/components/plots/radialPlot');

describe('Test for RadialPlot', function() {
    var plot;

    beforeEach(function() {
        plot = new radialPlotFactory.RadialPlot({
            theme: {
                lineColor: 'black'
            }
        });
    });

    it('_makePositions should make plotPositions', function() {
        var result = plot._makePositions({
            yAxis: {
                tickCount: 6
            },
            xAxis: {
                labels: ['1', '2', '3', '4', '5', '6']
            }
        }, {
            position: {
                top: 0,
                left: 0
            },
            dimension: {
                width: 476,
                height: 371
            }
        });

        expect(result.length).toEqual(6);
        expect(result[0].length).toEqual(7);
        expect(result[0][0]).toEqual({
            left: 238,
            top: 185.5
        });
        expect(result[5][6]).toEqual({
            left: 238,
            top: 37.5
        });
    });
    it('_makeCategoryPositions should make category positions', function() {
        var result = plot._makeCategoryPositions({
            xAxis: {
                labels: ['1', '2', '3', '4', '5', '6']
            }
        }, {
            position: {
                top: 0,
                left: 0
            },
            dimension: {
                width: 476,
                height: 371
            }
        });

        expect(result.length).toEqual(6);
        expect(parseInt(result[0].left, 10)).toEqual(238);
        expect(parseInt(result[0].top, 10)).toEqual(17);
        expect(parseInt(result[5].left, 10)).toEqual(92);
        expect(parseInt(result[5].top, 10)).toEqual(101);
    });
});
