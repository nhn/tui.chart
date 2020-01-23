/**
 * @fileoverview Test for SeriesDataModelForTreemap.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import SeriesDataModel from '../../../src/js/models/data/seriesDataModelForTreemap';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import chartConst from '../../../src/js/const';

describe('Test for SeriesDataModelForTreemap', () => {
  const rootId = chartConst.TREEMAP_ROOT_ID;
  const idPrefix = chartConst.TREEMAP_ID_PREFIX;
  let seriesDataModel, seriesGroup;

  beforeEach(() => {
    seriesDataModel = new SeriesDataModel([]);
    seriesGroup = new SeriesGroup([]);
  });

  describe('_flattenHierarchicalData()', () => {
    it('flatten hierarchical data', () => {
      const rawSeriesData = [
        {
          label: 'label1',
          children: [
            {
              label: 'label1-1',
              children: [
                {
                  label: 'label1-1-1',
                  value: 5
                },
                {
                  label: 'label1-1-2',
                  value: 7
                }
              ]
            },
            {
              label: 'label1-2',
              value: 3
            }
          ]
        }
      ];
      const actual = seriesDataModel._flattenHierarchicalData(rawSeriesData);
      const expected = [
        {
          id: `${idPrefix}0`,
          parent: rootId,
          label: 'label1',
          indexes: [0]
        },
        {
          id: `${idPrefix}0_0`,
          parent: `${idPrefix}0`,
          label: 'label1-1',
          indexes: [0, 0]
        },
        {
          id: `${idPrefix}0_0_0`,
          parent: `${idPrefix}0_0`,
          label: `label1-1-1`,
          value: 5,
          indexes: [0, 0, 0]
        },
        {
          id: `${idPrefix}0_0_1`,
          parent: `${idPrefix}0_0`,
          label: `label1-1-2`,
          value: 7,
          indexes: [0, 0, 1]
        },
        {
          id: `${idPrefix}0_1`,
          parent: `${idPrefix}0`,
          label: `label1-2`,
          value: 3,
          indexes: [0, 1]
        }
      ];

      expect(actual).toEqual(expected);
    });
    it('except null value data child from flatten hierarchical data', () => {
      const rawSeriesData = [
        {
          label: 'label1',
          children: [
            {
              label: 'label1-1',
              children: [
                {
                  label: 'label1-1-1',
                  value: null
                },
                {
                  label: 'label1-1-2',
                  value: 7
                }
              ]
            },
            {
              label: 'label1-2',
              value: 3
            }
          ]
        }
      ];
      const actual = seriesDataModel._flattenHierarchicalData(rawSeriesData);
      const expected = [
        {
          id: `${idPrefix}0`,
          parent: rootId,
          label: 'label1',
          indexes: [0]
        },
        {
          id: `${idPrefix}0_0`,
          parent: `${idPrefix}0`,
          label: 'label1-1',
          indexes: [0, 0]
        },
        {
          id: `${idPrefix}0_0_1`,
          parent: `${idPrefix}0_0`,
          label: `label1-1-2`,
          value: 7,
          indexes: [0, 0, 1]
        },
        {
          id: `${idPrefix}0_1`,
          parent: `${idPrefix}0`,
          label: `label1-2`,
          value: 3,
          indexes: [0, 1]
        }
      ];

      expect(actual).toEqual(expected);
      expect(actual.length).toEqual(expected.length);
    });
  });

  describe('_partitionRawSeriesDataByParent()', () => {
    it('partition raw series data by parent', () => {
      const rawSeriesData = [
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
      const actual = seriesDataModel._partitionRawSeriesDataByParent(rawSeriesData, 'root');

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

  describe('_setTreeProperties()', () => {
    it('set tree properties(depth, group, value) by depth and value', () => {
      const rawSeriesData = [
        { parent: rootId, id: 'id_0' },
        { parent: 'id_0', id: 'id_0_0', value: 1 },
        { parent: 'id_0', id: 'id_0_1', value: 2 }
      ];
      const actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

      expect(actual[0].depth).toBe(1);
      expect(actual[1].depth).toBe(2);
      expect(actual[2].depth).toBe(2);

      expect(actual[1].value).toBe(2);
      expect(actual[2].value).toBe(1);
    });

    it('set tree properties(depth, group, value) for first and second depth', () => {
      const rawSeriesData = [
        { parent: rootId, id: 'id_0' },
        { parent: 'id_0', id: 'id_0_0', value: 1 },
        { parent: 'id_0', id: 'id_0_1', value: 2 }
      ];
      const actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

      expect(actual[0]).toEqual({
        parent: rootId,
        id: 'id_0',
        depth: 1,
        value: 3,
        group: 0,
        hasChild: true
      });
      expect(actual[1]).toEqual({
        parent: 'id_0',
        id: 'id_0_1',
        depth: 2,
        value: 2,
        group: 0,
        hasChild: false
      });
      expect(actual[2]).toEqual({
        parent: 'id_0',
        id: 'id_0_0',
        depth: 2,
        value: 1,
        group: 0,
        hasChild: false
      });
    });

    it('set tree properties(depth, group, value) for first, second and third depth', () => {
      const rawSeriesData = [
        { parent: rootId, id: 'id_0' },
        { parent: 'id_0', id: 'id_0_0' },
        { parent: 'id_0_0', id: 'id_0_0_0', value: 4 },
        { parent: 'id_0', id: 'id_0_1', value: 5 }
      ];
      const actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

      expect(actual[0]).toEqual({
        parent: rootId,
        id: 'id_0',
        depth: 1,
        value: 9,
        group: 0,
        hasChild: true
      });
      expect(actual[1]).toEqual({
        parent: 'id_0',
        id: 'id_0_1',
        depth: 2,
        value: 5,
        group: 0,
        hasChild: false
      });
      expect(actual[2]).toEqual({
        parent: 'id_0',
        id: 'id_0_0',
        depth: 2,
        value: 4,
        group: 0,
        hasChild: true
      });
      expect(actual[3]).toEqual({
        parent: 'id_0_0',
        id: 'id_0_0_0',
        depth: 3,
        value: 4,
        group: 0,
        hasChild: false
      });
    });

    it('group property is index of first depth', () => {
      const rawSeriesData = [
        { parent: rootId, id: 'id_0' },
        { parent: 'id_0', id: 'id_0_0', value: 4 },
        { parent: rootId, id: 'id_1' },
        { parent: 'id_1', id: 'id_1_0', value: 5 }
      ];
      const actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

      expect(actual[0].id).toBe('id_0');
      expect(actual[0].group).toBe(0);
      expect(actual[1].id).toBe('id_1');
      expect(actual[1].group).toBe(1);
      expect(actual[2].id).toBe('id_0_0');
      expect(actual[2].group).toBe(0);
      expect(actual[3].id).toBe('id_1_0');
      expect(actual[3].group).toBe(1);
    });

    it('reject item when has wrong parent id', () => {
      const rawSeriesData = [
        { parent: rootId, id: 'id_0' },
        { parent: 'id_0', id: 'id_0_0', value: 1 },
        { parent: 'aaa', id: 'bbb' }
      ];
      const actual = seriesDataModel._setTreeProperties(rawSeriesData, 1, rootId);

      expect(actual.length).toBe(2);
      expect(actual).toEqual([
        { parent: rootId, id: 'id_0', depth: 1, value: 1, group: 0, hasChild: true },
        { parent: 'id_0', id: 'id_0_0', depth: 2, value: 1, group: 0, hasChild: false }
      ]);
    });
  });

  describe('_setRatio()', () => {
    it('set ratio', () => {
      const flatSeriesData = [
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

    it('set ratio, when two depth seriesData', () => {
      const flatSeriesData = [
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

  describe('_makeCacheKey()', () => {
    it('make cache key for caching found SeriesItems', () => {
      const actual = seriesDataModel._makeCacheKey('prefix_', 1, 2, 3);

      expect(actual).toBe('prefix_1_2_3');
    });
  });

  describe('findSeriesItemsByDepth()', () => {
    beforeEach(() => {
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

    it('find seriesItems by depth', () => {
      const actual = seriesDataModel.findSeriesItemsByDepth(1);

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

    it('if exist group argument, find seriesItems by depth and group', () => {
      const actual = seriesDataModel.findSeriesItemsByDepth(2, 1);

      expect(actual.length).toBe(1);
      expect(actual[0]).toEqual({
        depth: 2,
        id: 'id_1_0',
        group: 1
      });
    });
  });

  describe('findSeriesItemsByParent()', () => {
    it('find seriesItems by parent', () => {
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

      const actual = seriesDataModel.findSeriesItemsByParent('root');

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

  describe('findLeafSeriesItems()', () => {
    beforeEach(() => {
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

    it('find left seriesItems', () => {
      const actual = seriesDataModel.findLeafSeriesItems();

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

    it('find left seriesItems, when group argument is 1', () => {
      const group = 1;
      const actual = seriesDataModel.findLeafSeriesItems(group);

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

  describe('findParentByDepth()', () => {
    beforeEach(() => {
      seriesGroup.items = [
        {
          depth: 1,
          id: 'id0',
          parent: 'root',
          group: 0
        },
        {
          depth: 2,
          id: 'id00',
          parent: 'id0',
          group: 0
        },
        {
          depth: 3,
          id: 'id000',
          parent: 'id00',
          group: 0,
          isLeaf: true
        },
        {
          depth: 1,
          id: 'id1',
          parent: 'root',
          group: 1
        },
        {
          depth: 2,
          id: 'id10',
          parent: 'id1',
          group: 1
        },
        {
          depth: 3,
          id: 'id010',
          parent: 'id10',
          group: 0,
          isLeaf: true
        }
      ];
      seriesDataModel.seriesItemMap = {
        id0: {
          depth: 1,
          id: 'id0',
          parent: 'root',
          group: 0
        },
        id00: {
          depth: 2,
          id: 'id00',
          parent: 'id0',
          group: 0
        },
        id000: {
          depth: 3,
          id: 'id000',
          parent: 'id00',
          group: 0,
          isLeaf: true
        },
        id1: {
          depth: 1,
          id: 'id1',
          parent: 'root',
          group: 1
        },
        id10: {
          depth: 2,
          id: 'id10',
          parent: 'id1',
          group: 1
        },
        id010: {
          depth: 3,
          id: 'id010',
          parent: 'id10',
          group: 0,
          isLeaf: true
        }
      };
    });

    it('find parent by depth', () => {
      const actual = seriesDataModel.findParentByDepth('id010', 1);

      expect(actual).toEqual({
        depth: 1,
        id: 'id1',
        parent: 'root',
        group: 1
      });
    });

    it('if not found parent, returns null', () => {
      const actual = seriesDataModel.findParentByDepth('id011', 1);

      expect(actual).toBeNull();
    });
  });
});
