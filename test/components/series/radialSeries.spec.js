/**
 * @fileoverview test radial series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var radialSeriesFactory = require('../../../src/js/components/series/radialSeries');
var snippet = require('tui-code-snippet');

describe('Test for RadialSeries', function() {
    var series;

    beforeEach(function() {
        series = new radialSeriesFactory.RadialChartSeries({
            chartType: 'radial',
            theme: {
                radial: {
                    label: {
                        fontFamily: 'Verdana',
                        fontSize: 11,
                        fontWeight: 'normal'
                    },
                    colors: ['blue']
                }
            },
            eventBus: new snippet.CustomEvents()
        });
    });

    it('_makePositions should make point positions', function() {
        var positions;

        series.layout = {
            dimension: {
                width: 100,
                height: 100
            },
            position: {
                left: 0,
                top: 0
            }
        };

        positions = series._makePositionsForRadial([
            [
                {
                    ratio: 1
                },
                {
                    ratio: 0.5
                },
                {
                    ratio: 0
                }
            ]
        ], 3);

        expect(parseInt(positions[0][0].left, 10)).toEqual(50);
        expect(parseInt(positions[0][0].top, 10)).toEqual(37);
        expect(parseInt(positions[0][1].left, 10)).toEqual(55);
        expect(parseInt(positions[0][1].top, 10)).toEqual(53);
        expect(parseInt(positions[0][2].left, 10)).toEqual(50);
        expect(parseInt(positions[0][2].top, 10)).toEqual(50);
    });
});
