/**
 * @fileoverview Test for SeriesDataModelForTreemap.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesDataModel = require('../../../src/js/models/data/seriesDataModelForTreemap');
var SeriesGroup = require('../../../src/js/models/data/seriesGroup');
var chartConst = require('../../../src/js/const');

describe('Test for SeriesDataModelForTreemap', function() {
    var rootId = chartConst.TREEMAP_ROOT_ID;
    var idPrefix = chartConst.TREEMAP_ID_PREFIX;
    var seriesDataModel, seriesGroup;

    beforeEach(function() {
        seriesDataModel = new SeriesDataModel([]);
        seriesGroup = new SeriesGroup([]);
    });

    describe('_flattenHierarchicalData()', function() {
        it('flatten hierarchical data', function() {
            var rawSeriesData = [
                {
                    label: 'label1',
                    children: [
                        {
                            label: 'label1-1',
                            children: [
                                {
                                    label: 'label1-1-1',
                                    value: 5
                                }, {
                                    label: 'label1-1-2',
                                    value: 7
                                }
                            ]
                        }, {
                            label: 'label1-2',
                            value: 3
                        }
                    ]
                }
            ];
            var actual = seriesDataModel._flattenHierarchicalData(rawSeriesData);
            var expected = [
                {
                    id: idPrefix + '0',
                    parent: rootId,
                    label: 'label1',
                    indexes: [0]
                }, {
                    id: idPrefix + '0_0',
                    parent: idPrefix + '0',
                    label: 'label1-1',
                    indexes: [0, 0]
                }, {
                    id: idPrefix + '0_0_0',
                    parent: idPrefix + '0_0',
                    label: 'label1-1-1',
                    value: 5,
                    indexes: [0, 0, 0]
                }, {
                    id: idPrefix + '0_0_1',
                    parent: idPrefix + '0_0',
                    label: 'label1-1-2',
                    value: 7,
                    indexes: [0, 0, 1]
                }, {
                    id: idPrefix + '0_1',
                    parent: idPrefix + '0',
                    label: 'label1-2',
                    value: 3,
                    indexes: [0, 1]
                }
            ];

            expect(actual).toEqual(expected);
        });
        it('except null value data child from flatten hierarchical data', function() {
            var rawSeriesData = [
                {
                    label: 'label1',
                    children: [
                        {
                            label: 'label1-1',
                            children: [
                                {
                                    label: 'label1-1-1',
                                    value: null
                                }, {
                                    label: 'label1-1-2',
                                    value: 7
                                }
                            ]
                        }, {
                            label: 'label1-2',
                            value: 3
                        }
                    ]
                }
            ];
            var actual = seriesDataModel._flattenHierarchicalData(rawSeriesData);
            var expected = [
                {
                    id: idPrefix + '0',
                    parent: rootId,
                    label: 'label1',
                    indexes: [0]
                }, {
                    id: idPrefix + '0_0',
                    parent: idPrefix + '0',
                    label: 'label1-1',
                    indexes: [0, 0]
                }, {
                    id: idPrefix + '0_0_1',
                    parent: idPrefix + '0_0',
                    label: 'label1-1-2',
                    value: 7,
                    indexes: [0, 0, 1]
                }, {
                    id: idPrefix + '0_1',
                    parent: idPrefix + '0',
                    label: 'label1-2',
                    value: 3,
                    indexes: [0, 1]
                }
            ];

            expect(actual).toEqual(expected);
            expect(actual.length).toEqual(expected.length);
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

            expect(actual[0]).toEqual({parent: rootId, id: 'id_0', depth: 1, value: 3, group: 0, hasChild: true});
            expect(actual[1]).toEqual({parent: 'id_0', id: 'id_0_0', depth: 2, value: 1, group: 0, hasChild: false});
            expect(actual[2]).toEqual({parent: 'id_0', id: 'id_0_1', depth: 2, value: 2, group: 0, hasChild: false});
        });

        it('set tree properties(depth, group, value) for first, second and third depth', function() {
            var rawSeriesData = [
                {parent: rootId, id: 'id_0'},
                {parent: 'id_0', id: 'id_0_0'},
                {parent: 'id_0_0', id: 'id_0_0_0', value: 4},
                {parent: 'id_0', id: 'id_0_1', value: 5}
            ];
            var actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

            expect(actual[0]).toEqual({parent: rootId, id: 'id_0', depth: 1, value: 9, group: 0, hasChild: true});
            expect(actual[1]).toEqual({parent: 'id_0', id: 'id_0_0', depth: 2, value: 4, group: 0, hasChild: true});
            expect(actual[2]).toEqual({parent: 'id_0', id: 'id_0_1', depth: 2, value: 5, group: 0, hasChild: false});
            expect(actual[3]).toEqual({parent: 'id_0_0', id: 'id_0_0_0', depth: 3, value: 4, group: 0, hasChild: false});
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
                {parent: rootId, id: 'id_0', depth: 1, value: 1, group: 0, hasChild: true},
                {parent: 'id_0', id: 'id_0_0', depth: 2, value: 1, group: 0, hasChild: false}
            ]);
        });
    });

    describe('_setRatio()', function() {
        it('set ratio', function() {
            var flatSeriesData = [
                {
                    parent: rootId,
                    value: 20
                },
                {
                    parent: rootId,
                    value: 30
                },
                {
                    parent: rootId,
                    value: 50
                }
            ];
            seriesDataModel._setRatio(flatSeriesData, rootId);

            expect(flatSeriesData[0].ratio).toBe(0.2);
            expect(flatSeriesData[1].ratio).toBe(0.3);
            expect(flatSeriesData[2].ratio).toBe(0.5);
        });

        it('set ratio, when two depth seriesData', function() {
            var flatSeriesData = [
                {
                    id: '1_1',
                    parent: rootId,
                    value: 20
                },
                {
                    id: '1_2',
                    parent: rootId,
                    value: 30
                },
                {
                    id: '1_3',
                    parent: rootId,
                    value: 50,
                    hasChild: true
                },
                {
                    parent: '1_3',
                    value: 20
                },
                {
                    parent: '1_3',
                    value: 30
                }
            ];
            seriesDataModel._setRatio(flatSeriesData, rootId);

            expect(flatSeriesData[0].ratio).toBe(0.2);
            expect(flatSeriesData[1].ratio).toBe(0.3);
            expect(flatSeriesData[2].ratio).toBe(0.5);
            expect(flatSeriesData[3].ratio).toBe(0.4);
            expect(flatSeriesData[4].ratio).toBe(0.6);
        });
    });

    describe('_makeCacheKey()', function() {
        it('make cache key for caching found SeriesItems', function() {
            var actual = seriesDataModel._makeCacheKey('prefix_', 1, 2, 3);

            expect(actual).toBe('prefix_1_2_3');
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

    describe('findLeafSeriesItems()', function() {
        beforeEach(function() {
            seriesGroup.items = [
                {
                    depth: 1,
                    id: 'id_0',
                    parent: 'root',
                    group: 0,
                    hasChild: true
                },
                {
                    depth: 2,
                    id: 'id_0_0',
                    parent: 'id_0',
                    group: 0,
                    hasChild: false
                },
                {
                    depth: 1,
                    id: 'id_1',
                    parent: 'root',
                    group: 1,
                    hasChild: true
                },
                {
                    depth: 2,
                    id: 'id_1_0',
                    parent: 'id_1',
                    group: 1,
                    hasChild: false
                }
            ];
            spyOn(seriesDataModel, 'getFirstSeriesGroup').and.returnValue(seriesGroup);
        });

        it('find left seriesItems', function() {
            var actual = seriesDataModel.findLeafSeriesItems();

            expect(actual.length).toBe(2);
            expect(actual[0]).toEqual({
                depth: 2,
                id: 'id_0_0',
                parent: 'id_0',
                group: 0,
                hasChild: false
            });
            expect(actual[1]).toEqual({
                depth: 2,
                id: 'id_1_0',
                parent: 'id_1',
                group: 1,
                hasChild: false
            });
        });

        it('find left seriesItems, when group argument is 1', function() {
            var group = 1;
            var actual = seriesDataModel.findLeafSeriesItems(group);

            expect(actual.length).toBe(1);
            expect(actual[0]).toEqual({
                depth: 2,
                id: 'id_1_0',
                parent: 'id_1',
                group: 1,
                hasChild: false
            });
        });
    });

    describe('findParentByDepth()', function() {
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
                    depth: 3,
                    id: 'id_0_0_0',
                    parent: 'id_0_0',
                    group: 0,
                    isLeaf: true
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
                },
                {
                    depth: 3,
                    id: 'id_0_1_0',
                    parent: 'id_1_0',
                    group: 0,
                    isLeaf: true
                }
            ];
            seriesDataModel.seriesItemMap = {
                'id_0': {
                    depth: 1,
                    id: 'id_0',
                    parent: 'root',
                    group: 0
                },
                'id_0_0': {
                    depth: 2,
                    id: 'id_0_0',
                    parent: 'id_0',
                    group: 0
                },
                'id_0_0_0': {
                    depth: 3,
                    id: 'id_0_0_0',
                    parent: 'id_0_0',
                    group: 0,
                    isLeaf: true
                },
                'id_1': {
                    depth: 1,
                    id: 'id_1',
                    parent: 'root',
                    group: 1
                },
                'id_1_0': {
                    depth: 2,
                    id: 'id_1_0',
                    parent: 'id_1',
                    group: 1
                },
                'id_0_1_0': {
                    depth: 3,
                    id: 'id_0_1_0',
                    parent: 'id_1_0',
                    group: 0,
                    isLeaf: true
                }
            };
        });

        it('find parent by depth', function() {
            var actual = seriesDataModel.findParentByDepth('id_0_1_0', 1);

            expect(actual).toEqual({
                depth: 1,
                id: 'id_1',
                parent: 'root',
                group: 1
            });
        });

        it('if not found parent, returns null', function() {
            var actual = seriesDataModel.findParentByDepth('id_0_1_1', 1);

            expect(actual).toBeNull();
        });
    });
});
