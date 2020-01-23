/**
 * @fileoverview Test for rawDataHandler.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import rawDataHandler from '../../../src/js/models/data/rawDataHandler.js';
import chartConst from '../../../src/js/const';

describe('Test for rawDataHandler', () => {
  describe('_pickStacks', () => {
    it('should pick stack from rawSeriesData.', () => {
      const rawSeriesData = [
          {
            data: [],
            stack: 'stack1'
          },
          {
            data: [],
            stack: 'stack2'
          }
        ],
        actual = rawDataHandler.pickStacks(rawSeriesData),
        expected = ['stack1', 'stack2'];
      expect(actual).toEqual(expected);
    });

    it('should append DEFAULT_STACK, when there is no stack value', () => {
      const rawSeriesData = [
          {
            data: []
          },
          {
            data: [],
            stack: 'stack1'
          }
        ],
        actual = rawDataHandler.pickStacks(rawSeriesData),
        expected = ['stack1', chartConst.DEFAULT_STACK];
      expect(actual).toEqual(expected);
    });

    it('should return values in input order, and no duplication', () => {
      const rawSeriesData = [
          {
            data: [],
            stack: 'stack1'
          },
          {
            data: [],
            stack: 'stack2'
          },
          {
            data: [],
            stack: 'stack2'
          }
        ],
        actual = rawDataHandler.pickStacks(rawSeriesData),
        expected = ['stack1', 'stack2'];
      expect(actual).toEqual(expected);
    });

    it('should not limit a number of stacks, when there is not divergingOption.', () => {
      const rawSeriesData = [
          {
            data: [],
            stack: 'stack1'
          },
          {
            data: [],
            stack: 'stack2'
          },
          {
            data: [],
            stack: 'stack3'
          }
        ],
        actual = rawDataHandler.pickStacks(rawSeriesData),
        expected = ['stack1', 'stack2', 'stack3'];
      expect(actual).toEqual(expected);
    });

    it('should use values up to 2, when diversingOption is true', () => {
      const rawSeriesData = [
        {
          data: [],
          stack: 'stack1'
        },
        {
          data: [],
          stack: 'stack2'
        },
        {
          data: [],
          stack: 'stack3'
        }
      ];
      const divergingOption = true;
      const actual = rawDataHandler.pickStacks(rawSeriesData, divergingOption);
      const expected = ['stack1', 'stack2'];
      expect(actual).toEqual(expected);
    });

    it('should return arrays with DEFAULT_STACK, when all data does not have stack property', () => {
      const rawSeriesData = [
          {
            data: []
          },
          {
            data: []
          }
        ],
        actual = rawDataHandler.pickStacks(rawSeriesData),
        expected = [chartConst.DEFAULT_STACK];
      expect(actual).toEqual(expected);
    });
  });

  describe('_sortSeriesData()', () => {
    it('should sort series data order by stacks', () => {
      const rawSriesData = [
          {
            data: [1, 2, 3],
            stack: 'st1'
          },
          {
            data: [4, 5, 6],
            stack: 'st2'
          },
          {
            data: [9, 8, 7],
            stack: 'st1'
          }
        ],
        stacks = ['st1', 'st2'],
        actual = rawDataHandler._sortSeriesData(rawSriesData, stacks),
        expected = [
          {
            data: [1, 2, 3],
            stack: 'st1'
          },
          {
            data: [9, 8, 7],
            stack: 'st1'
          },
          {
            data: [4, 5, 6],
            stack: 'st2'
          }
        ];

      expect(actual).toEqual(expected);
    });
  });

  describe('removeSeriesStack()', () => {
    it('should delete stack property from seriesData', () => {
      const rawSriesData = [
        {
          data: [1, 2, 3],
          stack: 'st1'
        },
        {
          data: [4, 5, 6],
          stack: 'st2'
        },
        {
          data: [9, 8, 7],
          stack: 'st1'
        }
      ];

      rawDataHandler.removeSeriesStack(rawSriesData);
      const actual = rawSriesData;
      const expected = [
        {
          data: [1, 2, 3]
        },
        {
          data: [4, 5, 6]
        },
        {
          data: [9, 8, 7]
        }
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeNormalDivergingrawSeriesDataData()', () => {
    it('should use data upto second element, when data have not stack property.', () => {
      const rawSeriesData = [
        {
          data: [1, 2, 3]
        },
        {
          data: [4, 5, 6]
        },
        {
          data: [7, 8, 9]
        }
      ];
      const actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
      const expected = [
        {
          data: [-1, -2, -3]
        },
        {
          data: [4, 5, 6]
        }
      ];

      expect(actual).toEqual(expected);
    });

    it('should change data of index 0, by making positives to negatives, and negatives to 0', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3]
        }
      ];
      const actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
      const expected = [
        {
          data: [-1, 0, -3]
        }
      ];

      expect(actual).toEqual(expected);
    });

    it('should change data of index 1, by making negatives to 0', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3]
        },
        {
          data: [-4, 5, 6]
        }
      ];
      const actual = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);
      const expected = [
        {
          data: [-1, 0, -3]
        },
        {
          data: [0, 5, 6]
        }
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeRawSeriesDataForStackedDiverging()', () => {
    it('should change data of index 0, by making positives to negatives, negatives to 0', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
      const expected = [
        {
          data: [-1, 0, -3],
          stack: 'stack1'
        }
      ];
      expect(actual).toEqual(expected);
    });

    it('should change data of index 1, by making negatives to zero', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        },
        {
          data: [-4, 5, 6],
          stack: 'stack2'
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
      const expected = [
        {
          data: [-1, 0, -3],
          stack: 'stack1'
        },
        {
          data: [0, 5, 6],
          stack: 'stack2'
        }
      ];

      expect(actual).toEqual(expected);
    });

    it('should change data without stack property, by making negatives to 0', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        },
        {
          data: [-4, 5, 6]
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);
      const expected = [
        {
          data: [-1, 0, -3],
          stack: 'stack1'
        },
        {
          data: [0, 5, 6]
        }
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeRawSeriesDataForDiverging()', () => {
    it('should call _makeNormalDivergingRawSeriesData() when there is not stackType option', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        },
        {
          data: [-4, 5, 6],
          stack: 'stack2'
        },
        {
          data: [7, 8, 9],
          stack: 'stack1'
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData);
      const expected = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);

      expect(actual).toEqual(expected);
    });

    it('should return value of _makeRawSeriesDataForStackedDiverging(), when stackType option is valid', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        },
        {
          data: [-4, 5, 6],
          stack: 'stack2'
        },
        {
          data: [7, 8, 9],
          stack: 'stack1'
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData, 'normal');
      const expected = rawDataHandler._makeRawSeriesDataForStackedDiverging(rawSeriesData);

      expect(actual).toEqual(expected);
    });

    it('should return value of _makeNormalDivergingRawSeriesData(), when stackType option is invalid.', () => {
      const rawSeriesData = [
        {
          data: [1, -2, 3],
          stack: 'stack1'
        },
        {
          data: [-4, 5, 6],
          stack: 'stack2'
        },
        {
          data: [7, 8, 9],
          stack: 'stack1'
        }
      ];
      const actual = rawDataHandler._makeRawSeriesDataForDiverging(rawSeriesData, true);
      const expected = rawDataHandler._makeNormalDivergingRawSeriesData(rawSeriesData);

      expect(actual).toEqual(expected);
    });
  });

  describe('filterCheckedRawData()', () => {
    it('should filter rawData of which legend is checked', () => {
      const actual = rawDataHandler.filterCheckedRawData(
        {
          series: {
            line: ['a', 'b', 'c', 'd']
          }
        },
        { line: [null, true, true] }
      );
      const expected = {
        line: ['b', 'c']
      };

      expect(actual.series).toEqual(expected);
    });

    it('should filter rawData by each chart type', () => {
      const actual = rawDataHandler.filterCheckedRawData(
        {
          series: {
            column: ['a', 'b', 'c', 'd'],
            line: ['e', 'f', 'g']
          }
        },
        {
          column: [null, true, null, true],
          line: [true]
        }
      );
      const expected = {
        column: ['b', 'd'],
        line: ['e']
      };

      expect(actual.series).toEqual(expected);
    });

    it('should filter categories of rawData by checkedLegends, if it is a bullet chart and fillSeriesName option is enabled', () => {
      const actual = rawDataHandler.filterCheckedRawData(
        {
          categories: ['a', 'b', 'c', 'd'],
          series: {
            bullet: ['a', 'b', 'c', 'd']
          }
        },
        {
          bullet: [null, true, null, true]
        },
        {
          fillSeriesName: true
        }
      );
      const expected = {
        categories: ['b', 'd'],
        series: {
          bullet: ['b', 'd']
        }
      };

      expect(actual.categories).toEqual(expected.categories);
      expect(actual.series).toEqual(expected.series);
    });

    it('should not filter categories of rawData by checkedLegends, when it is a bullet chart, and fillSeriesName option is disabled', () => {
      const actual = rawDataHandler.filterCheckedRawData(
        {
          categories: ['a', 'b'],
          series: {
            column: ['a', 'b', 'c', 'd']
          }
        },
        {
          column: [null, true, null, true]
        }
      );
      const expected = {
        categories: ['a', 'b'],
        series: {
          column: ['b', 'd']
        }
      };

      expect(actual.categories).toEqual(expected.categories);
      expect(actual.series).toEqual(expected.series);
    });
  });

  describe('_makeRawSeriesDataForBulletChart', () => {
    it("should fill categories to empty array, if there isn't categories property on rawData", () => {
      const rawData1 = {
        series: {}
      };
      const rawData2 = {
        series: {}
      };
      rawDataHandler._makeRawSeriesDataForBulletChart(rawData1);
      rawDataHandler._makeRawSeriesDataForBulletChart(rawData2, true);

      expect(rawData1.categories).toEqual([]);
      expect(rawData2.categories).toEqual([]);
    });

    it('should overwrite categories, when it is bullet chart', () => {
      const rawData = {
        categories: ['category-0'],
        series: {
          bullet: [{ name: 'series-0' }, { name: 'series-1' }, { name: 'series-2' }]
        }
      };
      rawDataHandler._makeRawSeriesDataForBulletChart(rawData);

      expect(rawData.categories).toEqual(['series-0', 'series-1', 'series-2']);
    });
  });
});
