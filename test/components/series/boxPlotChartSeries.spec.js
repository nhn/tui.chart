/**
 * @fileoverview test for MapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var boxPlotChartSeriesFactory = require('../../../src/js/components/series/boxPlotChartSeries.js');

describe('BoxPlotChartSeries', function() {
    describe('init()', function() {
        it('showLabel option should not be allowed.', function() {
            var series = new boxPlotChartSeriesFactory.BoxplotChartSeries({
                chartType: 'boxplot',
                options: {
                    showLabel: true
                },
                eventBus: new snippet.CustomEvents()
            });

            expect(series.supportSeriesLable).toBe(false);
        });
    });
});
