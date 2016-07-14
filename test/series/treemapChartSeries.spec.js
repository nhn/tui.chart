/**
 * @fileoverview test for TreemapChartSeries
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
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
                    id: 'id_2',
                    parent: rootId,
                    value: 4,
                    depth: 1,
                    group: 2
                },
                {
                    id: 'id_3',
                    parent: rootId,
                    value: 3,
                    depth: 1,
                    group: 3
                },
                {
                    id: 'id_4',
                    parent: rootId,
                    value: 2,
                    depth: 1,
                    group: 4
                },
                {
                    id: 'id_5',
                    parent: rootId,
                    value: 2,
                    depth: 1,
                    group: 5
                },
                {
                    id: 'id_6',
                    parent: rootId,
                    value: 1,
                    depth: 1,
                    group: 6
                }
            ];

            actual = series._makeBoundMap(rootId);
            expected = {
                'id_0': {left: 0, top: 0, width: 300, height: 200},
                'id_1': {left: 0, top: 200, width: 300, height: 200},
                'id_2': {left: 300, top: 0, width: 171.42857142857142, height: 233.33333333333334},
                'id_3': {left: 471.42857142857144, top: 0, width: 128.57142857142856, height: 233.33333333333334},
                'id_4': {left: 300, top: 233.33333333333334, width: 120, height: 166.66666666666666},
                'id_5': {left: 420, top: 233.33333333333334, width: 120, height: 166.66666666666666},
                'id_6': {left: 540, top: 233.33333333333334, width: 60, height: 166.66666666666666}
            };

            expect(actual).toEqual(expected);
        });
    });
});
