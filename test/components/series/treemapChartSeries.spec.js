/**
 * @fileoverview test for TreemapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var treemapSeriesFactory = require('../../../src/js/components/series/treemapChartSeries.js');
var SeriesDataModel = require('../../../src/js/models/data/seriesDataModelForTreemap');
var chartConst = require('../../../src/js/const');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var snippet = require('tui-code-snippet');

describe('TreemapChartSeries', function() {
    var rootId = chartConst.TREEMAP_ROOT_ID;
    var series, seriesDataModel;

    beforeAll(function() {
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(30);
    });

    beforeEach(function() {
        series = new treemapSeriesFactory.TreemapChartSeries({
            chartType: 'treemap',
            theme: {
                label: {
                    fontSize: 12,
                    fontFamily: 'Verdana',
                    fontWeight: 'normal'
                }
            },
            eventBus: new snippet.CustomEvents()
        });
        series.layout = {
            position: {
                left: 0,
                top: 0
            },
            dimension: {
                width: 600,
                height: 400
            }
        };
        seriesDataModel = new SeriesDataModel([], 'treemap');
        spyOn(series, '_getSeriesDataModel').and.returnValue(seriesDataModel);
    });

    describe('_makeBoundMap()', function() {
        it('make bound map by dimension', function() {
            var actual, expected;

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

    describe('_makeBounds()', function() {
        beforeEach(function() {
            seriesDataModel.rawSeriesData = [
                {
                    label: 'label1',
                    children: [
                        {
                            label: 'label1-1',
                            value: 6
                        }, {
                            label: 'label1-2',
                            children: [
                                {
                                    label: 'label1-2-1',
                                    children: [
                                        {
                                            label: 'label1-2-1-1',
                                            value: 2
                                        },
                                        {
                                            label: 'label1-2-1-2',
                                            value: 1
                                        }
                                    ]
                                },
                                {
                                    label: 'label1-2-2',
                                    value: 3
                                }
                            ]
                        }
                    ]
                }
            ];
        });

        it('make bounds for rendering graph, when zoomable', function() {
            var boundMap, actual;

            boundMap = series._makeBoundMap(rootId);
            series.options.zoomable = true;
            series.startDepth = 1;

            actual = series._makeBounds(boundMap);

            expect(actual.length).toBe(1);
            expect(actual[0].length).toBe(7);
            expect(actual[0][0]).toEqual({end: {left: 0, top: 0, width: 600, height: 400}});
            expect(actual[0][1]).toBeNull();
            expect(actual[0][2]).toBeNull();
            expect(actual[0][3]).toBeNull();
            expect(actual[0][4]).toBeNull();
            expect(actual[0][5]).toBeNull();
            expect(actual[0][6]).toBeNull();
        });

        it('make bounds for rendering graph, when not zoomable', function() {
            var boundMap, actual;

            boundMap = series._makeBoundMap(rootId);
            series.options.zoomable = false;
            series.startDepth = 1;

            actual = series._makeBounds(boundMap);

            expect(actual.length).toBe(1);
            expect(actual[0].length).toBe(7);
            expect(actual[0][0]).toBeNull();
            expect(actual[0][1]).toEqual({end: {left: 0, top: 0, width: 300, height: 400}});
            expect(actual[0][2]).toBeNull();
            expect(actual[0][3]).toBeNull();
            expect(actual[0][4]).toEqual({end: {left: 300, top: 200, width: 300, height: 200}});
            expect(actual[0][5]).toEqual({end: {left: 300, top: 0, width: 200, height: 200}});
            expect(actual[0][6]).toEqual({end: {left: 500, top: 0, width: 100, height: 200}});
        });
    });

    describe('_zoom()', function() {
        it('should be animated after zooming.', function() {
            series._renderSeriesArea = jasmine.createSpy('_renderSeriesArea');
            series.animateComponent = jasmine.createSpy('animateComponent');
            series._zoom(rootId, 2, 0);

            expect(series.animateComponent).toHaveBeenCalled();
        });
    });
});
