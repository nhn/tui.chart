/**
 * @fileoverview Test for SeriesDataModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import SeriesItem from '../../../src/js/models/data/seriesItem';
import SeriesItemForCoordinateType from '../../../src/js/models/data/seriesItemForCoordinateType';

describe('Test for SeriesDataModel', () => {
  let seriesDataModel;

  beforeEach(() => {
    seriesDataModel = new SeriesDataModel([]);
    seriesDataModel.options = {
      xAxis: {}
    };
  });

  describe('_removeRangeValue()', () => {
    it("should filter first element from series item's range data", () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [
            [10, 20],
            [20, 30]
          ]
        },
        {
          data: [
            [-20, 10],
            [30, 40]
          ]
        }
      ];

      seriesDataModel._removeRangeValue();

      expect(seriesDataModel.rawSeriesData[0].data).toEqual([10, 20]);
      expect(seriesDataModel.rawSeriesData[1].data).toEqual([-20, 30]);
    });

    it('should not filter data arrays, when range type chart like bar, column, area chart', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [
            [10, 20],
            [20, 30]
          ]
        },
        {
          data: [
            [-20, 10],
            [30, 40]
          ]
        }
      ];

      seriesDataModel.chartType = 'area';
      seriesDataModel._removeRangeValue();

      expect(seriesDataModel.rawSeriesData[0].data).toEqual([
        [10, 20],
        [20, 30]
      ]);
      expect(seriesDataModel.rawSeriesData[1].data).toEqual([
        [-20, 10],
        [30, 40]
      ]);
    });

    it('should not filter data arrays when, stack type chart', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [
            [10, 20],
            [20, 30]
          ]
        },
        {
          data: [
            [-20, 10],
            [30, 40]
          ]
        }
      ];

      seriesDataModel.chartType = 'pie';
      seriesDataModel.options = {
        stackType: 'normal'
      };
      seriesDataModel._removeRangeValue();

      expect(seriesDataModel.rawSeriesData[0].data).toEqual([10, 20]);
      expect(seriesDataModel.rawSeriesData[1].data).toEqual([-20, 30]);
    });
  });

  describe('_createBaseGroups()', () => {
    it('should create base groups from rawData.series', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [10, 20, 30],
          stack: 'st1'
        },
        {
          data: [40, 50, 60],
          stack: 'st2'
        }
      ];

      const actual = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(2);
      expect(actual[0].length).toBe(3);
      expect(actual[0][0].value).toBe(10);
      expect(actual[0][0].stack).toBe('st1');
      expect(actual[1][2].value).toBe(60);
      expect(actual[1][2].stack).toBe('st2');
    });

    it('should create base groups when it is pie chart and data type is number', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: 10
        },
        {
          data: 20
        }
      ];
      const actual = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(2);
      expect(actual[0][0].value).toBe(10);
      expect(actual[1][0].value).toBe(20);
    });

    it('should not create item when pie data is null.', () => {
      seriesDataModel.chartType = 'pie';
      seriesDataModel.rawSeriesData = [
        {
          data: null
        },
        {
          data: 20
        }
      ];
      const actual = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(2);
      expect(actual[0][0]).toBeUndefined();
      expect(actual[1][0].value).toBe(20);

      seriesDataModel.chartType = null;
    });

    it('should create groups on heatmap.', () => {
      seriesDataModel.chartType = 'heatmap';
      seriesDataModel.rawSeriesData = [
        [10, 20, 30],
        [40, 50, 60],
        [70, 80, 90]
      ];
      const actual = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(3);
      expect(actual[0][0].value).toBe(10);
      expect(actual[0][1].value).toBe(20);
      expect(actual[0][2].value).toBe(30);
      expect(actual[1][0].value).toBe(40);
      expect(actual[1][1].value).toBe(50);
      expect(actual[1][2].value).toBe(60);
      expect(actual[2][0].value).toBe(70);
      expect(actual[2][1].value).toBe(80);
      expect(actual[2][2].value).toBe(90);

      seriesDataModel.chartType = null;
    });

    it('should create groups on heatmap with null data.', () => {
      seriesDataModel.chartType = 'heatmap';
      seriesDataModel.rawSeriesData = [
        [10, 20, 30],
        [40, 50, 60],
        [70, 80, null]
      ];
      const actual = seriesDataModel._createBaseGroups();

      expect(actual.length).toBe(3);
      expect(actual[0][0].value).toBe(10);
      expect(actual[0][1].value).toBe(20);
      expect(actual[0][2].value).toBe(30);
      expect(actual[1][0].value).toBe(40);
      expect(actual[1][1].value).toBe(50);
      expect(actual[1][2].value).toBe(60);
      expect(actual[2][0].value).toBe(70);
      expect(actual[2][1].value).toBe(80);
      expect(actual[2][2].value).toBe(null);

      seriesDataModel.chartType = null;
    });

    it('if coordinate type chart, create seriesItem by SeriesItemForCoordinateType class', () => {
      seriesDataModel.isCoordinateType = true;
      seriesDataModel.rawSeriesData = [
        {
          data: [
            {
              x: 10,
              y: 20,
              r: 30,
              label: 'Label'
            }
          ]
        }
      ];

      const actual = seriesDataModel._createBaseGroups();

      expect(actual[0][0].x).toBe(10);
      expect(actual[0][0].y).toBe(20);
      expect(actual[0][0].r).toBe(30);
      expect(actual[0][0].label).toBe('Label');
    });

    it('if coordinate type chart, sort data by x value ascending', () => {
      seriesDataModel.isCoordinateType = true;
      seriesDataModel.rawSeriesData = [
        {
          data: [
            {
              x: 20,
              y: 1
            },
            {
              x: 10,
              y: 2
            },
            {
              x: 30,
              y: 3
            }
          ]
        }
      ];

      const actual = seriesDataModel._createBaseGroups();

      expect(actual[0][0].x).toBe(10);
      expect(actual[0][1].x).toBe(20);
      expect(actual[0][2].x).toBe(30);
    });
  });

  describe('_createSeriesGroupsFromRawData()', () => {
    it('should create groups which is consist of series group', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [10, 20, 30],
          stack: 'st1'
        },
        {
          data: [40, 50, 60],
          stack: 'st2'
        }
      ];
      const actual = seriesDataModel._createSeriesGroupsFromRawData();

      expect(actual.length).toBe(2);
      expect(actual[0].getSeriesItemCount()).toBe(3);
      expect(actual[0] instanceof SeriesGroup).toBe(true);
    });

    it('should create pivoted groups, if isPivot is true', () => {
      seriesDataModel.rawSeriesData = [
        {
          data: [10, 20, 30],
          stack: 'st1'
        },
        {
          data: [40, 50, 60],
          stack: 'st2'
        }
      ];
      const actual = seriesDataModel._createSeriesGroupsFromRawData(true);

      expect(actual.length).toBe(3);
      expect(actual[0].getSeriesItemCount()).toBe(2);
      expect(actual[0] instanceof SeriesGroup);
    });
  });

  describe('_createValues()', () => {
    it('create values that picked value from SeriesItems of SeriesGroups.', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItem({
            datum: 10
          }),
          new SeriesItem({
            datum: 20
          })
        ]),
        new SeriesGroup([
          new SeriesItem({
            datum: 30
          }),
          new SeriesItem({
            datum: 40
          })
        ])
      ];

      const actual = seriesDataModel._createValues('value');
      const expected = [10, 20, 30, 40];

      expect(actual).toEqual(expected);
    });

    it('if valueType is x, returns x values', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItemForCoordinateType({
            datum: {
              x: 10
            }
          }),
          new SeriesItemForCoordinateType({
            datum: {
              x: 20
            }
          })
        ])
      ];

      const actual = seriesDataModel._createValues('x');
      const expected = [10, 20];

      expect(actual).toEqual(expected);
    });

    it('if valueType is y, returns y values', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItemForCoordinateType({
            datum: {
              y: 10
            }
          }),
          new SeriesItemForCoordinateType({
            datum: {
              y: 20
            }
          })
        ])
      ];

      const actual = seriesDataModel._createValues('y');
      const expected = [10, 20];

      expect(actual).toEqual(expected);
    });

    it('if valueType is r, returns r values.', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItemForCoordinateType({
            datum: {
              r: 10
            }
          }),
          new SeriesItemForCoordinateType({
            datum: {
              r: 20
            }
          })
        ])
      ];

      const actual = seriesDataModel._createValues('r');
      const expected = [10, 20];

      expect(actual).toEqual(expected);
    });

    it('if values contain NaN, returns filtered values.', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          new SeriesItem({
            datum: 10
          }),
          new SeriesItem({})
        ]),
        new SeriesGroup([
          new SeriesItem({
            datum: 30
          }),
          new SeriesItem({
            datum: 40
          })
        ])
      ];

      const actual = seriesDataModel._createValues('value');
      const expected = [10, 30, 40];

      expect(actual).toEqual(expected);
    });
  });

  describe('_addRatiosWhenNormalStacked()', () => {
    it('should call addRatios() with limit values, when normal stack chart', () => {
      const seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatios']);

      seriesDataModel.groups = [seriesGroup];
      seriesDataModel._addRatiosWhenNormalStacked({ min: 0, max: 80 });

      expect(seriesGroup.addRatios).toHaveBeenCalledWith(80);
    });
  });

  describe('_calculateBaseRatio()', () => {
    it('should return 0.5 when value map consist of both positive and negative value', () => {
      seriesDataModel.valuesMap = {
        value: [-20, 40]
      };

      const actual = seriesDataModel._calculateBaseRatio();
      const expected = 0.5;

      expect(actual).toEqual(expected);
    });

    it('should return 1, when value map consist of only positive value, or only negative value', () => {
      seriesDataModel.valuesMap = {
        value: [20, 40]
      };

      const actual = seriesDataModel._calculateBaseRatio();
      const expected = 1;

      expect(actual).toEqual(expected);
    });
  });

  describe('_addRatiosWhenPercentStacked()', () => {
    it('should call seriesGroup.addRatiosWhenPercentStacked() with baseRatio, when percent stack chart', () => {
      const seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatiosWhenPercentStacked']);

      seriesDataModel.groups = [seriesGroup];
      seriesDataModel.valuesMap = {
        value: [20, 40]
      };

      seriesDataModel._addRatiosWhenPercentStacked('bar');

      expect(seriesGroup.addRatiosWhenPercentStacked).toHaveBeenCalledWith(1);
    });
  });

  describe('_addRatiosWhenDivergingStacked()', () => {
    it('should call seriesGroup.addRatiosWhenDivergingStacked() with plusSum and minusSum, when diverging stack chart', () => {
      const seriesGroup = jasmine.createSpyObj('seriesGroup', [
        'pluck',
        'addRatiosWhenDivergingStacked'
      ]);

      seriesGroup.pluck.and.returnValue([10, -20, 30, 40]);
      seriesDataModel.groups = [seriesGroup];

      seriesDataModel._addRatiosWhenDivergingStacked('bar');

      expect(seriesGroup.addRatiosWhenDivergingStacked).toHaveBeenCalledWith(80, 20);
    });
  });

  describe('_makeSubtractionValue()', () => {
    it('should return limit.max when it is not a line chart and min, max are all negative', () => {
      seriesDataModel.chartType = 'bar';
      const actual = seriesDataModel._makeSubtractionValue({
        min: -90,
        max: -20
      });
      const expected = -20;

      expect(actual).toEqual(expected);
    });

    it('should return limit.min, when it is line type chart', () => {
      seriesDataModel.chartType = 'line';
      const actual = seriesDataModel._makeSubtractionValue({
        min: -90,
        max: -20
      });
      const expected = -90;

      expect(actual).toEqual(expected);
    });

    it('should return limit.min, when it is not line type chart and min, max values are positive', () => {
      seriesDataModel.chartType = 'bar';
      const actual = seriesDataModel._makeSubtractionValue({
        min: 20,
        max: 90
      });
      const expected = 20;

      expect(actual).toEqual(expected);
    });

    it('should return 0 otherwise', () => {
      seriesDataModel.chartType = 'bar';
      const actual = seriesDataModel._makeSubtractionValue({
        min: -90,
        max: 90
      });
      const expected = 0;

      expect(actual).toEqual(expected);
    });
  });

  describe('_addRatios()', () => {
    it('should send limit interval and substraction value when chart is no option', () => {
      const seriesGroup = jasmine.createSpyObj('seriesGroup', ['addRatios']);

      seriesDataModel.groups = [seriesGroup];
      seriesDataModel._addRatios({ min: 0, max: 80 });

      expect(seriesGroup.addRatios).toHaveBeenCalledWith(80, 0);
    });
  });

  describe('addDataRatios()', () => {
    it('should add ratio data by calling _addRatios(), when chart is no option', () => {
      spyOn(seriesDataModel, '_addRatios');
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, null, 'column');

      expect(seriesDataModel._addRatios).toHaveBeenCalled();
    });

    it('should add ratio data by calling _addRatiosWhenNormalStacked(), when normal stack chart', () => {
      spyOn(seriesDataModel, '_addRatiosWhenNormalStacked');
      seriesDataModel.chartType = 'bar';
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, 'normal');

      expect(seriesDataModel._addRatiosWhenNormalStacked).toHaveBeenCalled();
    });

    it('should call _addRatios() when there is `invalid` stack type option.', () => {
      spyOn(seriesDataModel, '_addRatios');
      seriesDataModel.chartType = 'line';
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, 'normal');

      expect(seriesDataModel._addRatios).toHaveBeenCalled();
    });

    it('should call _addRatiosWhenDivergingStacked() when diverging percent stackType.', () => {
      spyOn(seriesDataModel, '_addRatiosWhenDivergingStacked');
      seriesDataModel.isDivergingChart = true;
      seriesDataModel.chartType = 'bar';
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, 'percent');

      expect(seriesDataModel._addRatiosWhenDivergingStacked).toHaveBeenCalled();
    });

    it('should call _addRatiosWhenPercentStacked(), when percent stack type', () => {
      spyOn(seriesDataModel, '_addRatiosWhenPercentStacked');
      seriesDataModel.chartType = 'bar';
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, 'percent');

      expect(seriesDataModel._addRatiosWhenPercentStacked).toHaveBeenCalled();
    });

    it('should call _addRatios() when there is percent stack type with in valid stackType option', () => {
      spyOn(seriesDataModel, '_addRatios');
      seriesDataModel.chartType = 'line';
      seriesDataModel.addDataRatios({ min: 0, max: 160 }, 'percent');

      expect(seriesDataModel._addRatios).toHaveBeenCalled();
    });
  });

  describe('addDataRatiosOfPieChart()', () => {
    it('should call addRatios() with all series group values, when pie chart', () => {
      const seriesGroup = jasmine.createSpyObj('seriesGroup', ['pluck', 'addRatios']);

      seriesDataModel.groups = [seriesGroup];
      seriesGroup.pluck.and.returnValue([10, 20, 30, 40]);
      seriesDataModel.addDataRatiosOfPieChart();

      expect(seriesGroup.addRatios).toHaveBeenCalledWith(100);
    });
  });

  describe('addDataRatiosForCoordinateType()', () => {
    it('should set x ratio using xDistance and xSubstraction values from limitMap.x', () => {
      const limitMap = {
        xAxis: {
          min: 0,
          max: 20
        }
      };
      const seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

      seriesDataModel.groups = [new SeriesGroup([seriesItem])];
      spyOn(seriesDataModel, 'getValues').and.returnValue([]);
      seriesDataModel.addDataRatiosForCoordinateType(limitMap);

      expect(seriesItem.addRatio).toHaveBeenCalledWith('x', 20, 0);
    });

    it('should set y ratio using yDistance and ySubstraction values from limitMap.y', () => {
      const limitMap = {
        yAxis: {
          min: 10,
          max: 50
        }
      };
      const seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

      seriesDataModel.groups = [new SeriesGroup([seriesItem])];
      spyOn(seriesDataModel, 'getValues').and.returnValue([]);
      seriesDataModel.addDataRatiosForCoordinateType(limitMap);

      expect(seriesItem.addRatio).toHaveBeenCalledWith('y', 40, 10);
    });

    it('should set r ratio from maxRadious', () => {
      const limitMap = {};
      const hasRadius = true;
      const seriesItem = jasmine.createSpyObj('seriesItem', ['addRatio']);

      seriesDataModel.groups = [new SeriesGroup([seriesItem])];
      spyOn(seriesDataModel, 'getValues').and.returnValue([5, 10]);
      seriesDataModel.addDataRatiosForCoordinateType(limitMap, hasRadius);

      expect(seriesItem.addRatio).toHaveBeenCalledWith('r', 10, 0);
    });
  });

  describe('each()', () => {
    it('should execuate iteratee for each series groups', () => {
      const spy = jasmine.createSpyObj('spy', ['iteratee']);

      seriesDataModel.groups = [
        new SeriesGroup([
          {
            value: 10
          },
          {
            value: 20
          }
        ]),
        new SeriesGroup([
          {
            value: 30
          },
          {
            value: 40
          }
        ])
      ];

      seriesDataModel.each(spy.iteratee);

      expect(spy.iteratee).toHaveBeenCalledTimes(2);
    });
  });

  describe('map()', () => {
    it('should return arrays after executing iteratee for each series group', () => {
      seriesDataModel.groups = [
        new SeriesGroup([
          {
            value: 10
          },
          {
            value: 20
          }
        ]),
        new SeriesGroup([
          {
            value: 30
          },
          {
            value: 40
          }
        ])
      ];

      const actual = seriesDataModel.map(seriesGroup => seriesGroup.getSeriesItemCount());
      const expected = [2, 2];

      expect(actual).toEqual(expected);
    });
  });
});
