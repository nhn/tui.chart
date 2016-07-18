/**
 * @fileoverview test for TreemapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TreemapChartSeries = require('../../src/js/series/treemapChartSeries.js');
var SeriesDataModel = require('../../src/js/dataModels/seriesDataModelForTreemap');
var chartConst = require('../../src/js/const');

describe('TreemapChartSeries', function() {
    var rootId = chartConst.TREEMAP_ROOT_ID;
    var series, boundsMaker, seriesDataModel;

    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
        seriesDataModel = new SeriesDataModel([], 'treemap');
    });

    beforeEach(function() {
        series = new TreemapChartSeries({
            boundsMaker: boundsMaker,
            chartType: 'treemap',
            theme: {}
        });
        spyOn(series, '_getSeriesDataModel').and.returnValue(seriesDataModel);
    });

    describe('_makeBoundMap()', function() {
        it('make bound map by dimension', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 600,
                height: 400
            });

            seriesDataModel.rawSeriesData = [
                {
                    id: 'id_0',
                    parent: rootId,
                    value: 6,
                    depth: 1,
                    group: 0
                },
                {
                    id: 'id_1',
                    parent: rootId,
                    value: 6,
                    depth: 1,
                    group: 1
                },
                {
                    id: 'id_3',
                    parent: rootId,
                    value: 3,
                    depth: 1,
                    group: 2
                },
                {
                    id: 'id_4',
                    parent: rootId,
                    value: 3,
                    depth: 1,
                    group: 3
                }
            ];

            actual = series._makeBoundMap(rootId);
            expected = {
                'id_0': {left: 0, top: 0, width: 200, height: 400},
                'id_1': {left: 200, top: 0, width: 400, height: 200},
                'id_3': {left: 200, top: 200, width: 200, height: 200},
                'id_4': {left: 400, top: 200, width: 200, height: 200}
            };

            expect(actual).toEqual(expected);
        });
    });
});
