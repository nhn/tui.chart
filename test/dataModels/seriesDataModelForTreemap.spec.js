/**
 * @fileoverview Test for SeriesDataModelForTreemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('../../src/js/dataModels/seriesDataModelForTreemap');
var SeriesGroup = require('../../src/js/dataModels/seriesGroup');
var chartConst = require('../../src/js/const');

describe('Test for SeriesDataModelForTreemap', function() {
    var rootId = chartConst.TREEMAP_ROOT_ID;
    var seriesDataModel, seriesGroup;

    beforeEach(function() {
        seriesDataModel = new SeriesDataModel([]);
        seriesGroup = new SeriesGroup([]);
    });

    describe('_setParentToRootId()', function() {
        it('set parent property to root id, when datum of rawSeriesData has not parent property', function() {
            var rawSeriesData = [
                {id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0', value: 1},
                {parent: 'id_0', id: 'id_0_1', value: 2},
                {id: 'id_1', value: 3}
            ];

            seriesDataModel._setParentToRootId(rawSeriesData);

            expect(rawSeriesData[0].parent).toBe(rootId);
            expect(rawSeriesData[1].parent).toBe('id_0');
            expect(rawSeriesData[2].parent).toBe('id_0');
            expect(rawSeriesData[3].parent).toBe(rootId);
        });
    });

    describe('_partitionRawSeriesDataByParent()', function() {
        it('partition raw series data by parent', function() {
            var rawSeriesData = [
                {
                    id: 'id_0',
                    parent: 'root'
                },
                {
                    id: 'id_0_0',
                    parent: 'id_0'
                },
                {
                    id: 'id_1',
                    parent: 'root'
                },
                {
                    id: 'id_1_0',
                    parent: 'id_1'
                }
            ];
            var actual = seriesDataModel._partitionRawSeriesDataByParent(rawSeriesData, 'root');

            expect(actual[0]).toEqual([
                {
                    id: 'id_0',
                    parent: 'root'
                },
                {
                    id: 'id_1',
                    parent: 'root'
                }
            ]);

            expect(actual[1]).toEqual([
                {
                    id: 'id_0_0',
                    parent: 'id_0'
                },
                {
                    id: 'id_1_0',
                    parent: 'id_1'
                }
            ]);
        });
    });

    describe('_setTreeProperties()', function() {
        it('set tree properties(depth, group, value) for first and second depth', function() {
            var rawSeriesData = [
                {parent: rootId, id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0', value: 1},
                {parent: 'id_0', id: 'id_0_1', value: 2}
            ];
            var actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

            expect(actual[0]).toEqual({parent: rootId, id: 'id_0', depth: 1, value: 3, group: 0});
            expect(actual[1]).toEqual({parent: 'id_0', id: 'id_0_0', depth: 2, value: 1, group: 0});
            expect(actual[2]).toEqual({parent: 'id_0', id: 'id_0_1', depth: 2, value: 2, group: 0});
        });

        it('set tree properties(depth, group, value) for first, second and third depth', function() {
            var rawSeriesData = [
                {parent: rootId, id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0'},
                {parent: 'id_0_0', id: 'id_0_0_0', value: 4},
                {parent: 'id_0', id: 'id_0_1', value: 5}
            ];
            var actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

            expect(actual[0]).toEqual({parent: rootId, id: 'id_0', depth: 1, value: 9, group: 0});
            expect(actual[1]).toEqual({parent: 'id_0', id: 'id_0_0', depth: 2, value: 4, group: 0});
            expect(actual[2]).toEqual({parent: 'id_0', id: 'id_0_1', depth: 2, value: 5, group: 0});
            expect(actual[3]).toEqual({parent: 'id_0_0', id: 'id_0_0_0', depth: 3, value: 4, group: 0});
        });

        it('group property is index of first depth', function() {
            var rawSeriesData = [
                {parent: rootId, id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0', value: 4},
                {parent: rootId, id: 'id_1'},
                {parent: 'id_1', id: 'id_1_0', value: 5}
            ];
            var actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

            expect(actual[0].id).toBe('id_0');
            expect(actual[0].group).toBe(0);
            expect(actual[1].id).toBe('id_1');
            expect(actual[1].group).toBe(1);
            expect(actual[2].id).toBe('id_0_0');
            expect(actual[2].group).toBe(0);
            expect(actual[3].id).toBe('id_1_0');
            expect(actual[3].group).toBe(1);
        });

        it('reject item when has wrong parent id', function() {
            var rawSeriesData = [
                {parent: rootId, id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0', value: 1},
                {parent: 'aaa', id: 'bbb'}
            ];
            var actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

            expect(actual.length).toBe(2);
            expect(actual).toEqual([
                {parent: rootId, id: 'id_0', depth: 1, value: 1, group: 0},
                {parent: 'id_0', id: 'id_0_0', depth: 2, value: 1, group: 0}
            ]);
        });
    });

    describe('findSeriesItemsByDepth()', function() {
        beforeEach(function() {
            seriesGroup.items = [
                {
                    depth: 1,
                    id: 'id_0',
                    group: 0
                },
                {
                    depth: 2,
                    id: 'id_0_0',
                    group: 0
                },
                {
                    depth: 1,
                    id: 'id_1',
                    group: 1
                },
                {
                    depth: 2,
                    id: 'id_1_0',
                    group: 1
                }
            ];
            spyOn(seriesDataModel, 'getFirstSeriesGroup').and.returnValue(seriesGroup);
        });

        it('find seriesItems by depth', function() {
            var actual;

            actual = seriesDataModel.findSeriesItemsByDepth(1);

            expect(actual.length).toBe(2);
            expect(actual[0]).toEqual({
                depth: 1,
                id: 'id_0',
                group: 0
            });
            expect(actual[1]).toEqual({
                depth: 1,
                id: 'id_1',
                group: 1
            });
        });

        it('if exist group argument, find seriesItems by depth and group', function() {
            var actual;

            actual = seriesDataModel.findSeriesItemsByDepth(2, 1);

            expect(actual.length).toBe(1);
            expect(actual[0]).toEqual({
                depth: 2,
                id: 'id_1_0',
                group: 1
            });
        });
    });

    describe('findSeriesItemsByParent()', function() {
        it('find seriesItems by parent', function() {
            var actual;

            seriesGroup.items = [
                {
                    depth: 1,
                    id: 'id_0',
                    parent: 'root'
                },
                {
                    depth: 2,
                    id: 'id_0_0',
                    parent: 'id_0'
                },
                {
                    depth: 1,
                    id: 'id_1',
                    parent: 'root'
                },
                {
                    depth: 2,
                    id: 'id_1_0',
                    parent: 'id_1'
                }
            ];
            spyOn(seriesDataModel, 'getFirstSeriesGroup').and.returnValue(seriesGroup);

            actual = seriesDataModel.findSeriesItemsByParent('root');

            expect(actual.length).toBe(2);
            expect(actual[0]).toEqual({
                depth: 1,
                id: 'id_0',
                parent: 'root'
            });
            expect(actual[1]).toEqual({
                depth: 1,
                id: 'id_1',
                parent: 'root'
            });
        });
    });

    describe('findSeriesItem()', function() {
        beforeEach(function() {
            seriesGroup.items = [
                {
                    depth: 1,
                    id: 'id_0',
                    parent: 'root',
                    group: 0
                },
                {
                    depth: 2,
                    id: 'id_0_0',
                    parent: 'id_0',
                    group: 0
                },
                {
                    depth: 1,
                    id: 'id_1',
                    parent: 'root',
                    group: 1
                },
                {
                    depth: 2,
                    id: 'id_1_0',
                    parent: 'id_1',
                    group: 1
                }
            ];
            spyOn(seriesDataModel, 'getFirstSeriesGroup').and.returnValue(seriesGroup);
        });

        it('find seriesItem by depth and dected index', function() {
            var actual;

            actual = seriesDataModel.findSeriesItem(1, null, 1);

            expect(actual).toEqual({
                depth: 1,
                id: 'id_1',
                parent: 'root',
                group: 1
            });
        });

        it('if exist group, find seriesItem by depth, group and dected index', function() {
            var actual;

            actual = seriesDataModel.findSeriesItem(2, 1, 0);

            expect(actual).toEqual({
                depth: 2,
                id: 'id_1_0',
                parent: 'id_1',
                group: 1
            });
        });
    });
});
