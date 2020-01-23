/**
 * @fileoverview test plot
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphael from 'raphael';
import plotFactory from '../../../src/js/components/plots/plot.js';
import DataProcessor from '../../../src/js/models/data/dataProcessor';
import chartConst from '../../../src/js/const';
import dom from '../../../src/js/helpers/domHandler.js';

describe('Test for Plot', () => {
  let plot, dataProcessor, paper;

  beforeEach(() => {
    paper = raphael(dom.create('div'));
    paper.pushDownBackgroundToBottom = () => {};

    dataProcessor = new DataProcessor({}, '', {});
    plot = new plotFactory.Plot({
      dataProcessor,
      theme: {
        lineColor: 'black'
      }
    });

    plot.paper = paper;
  });

  afterEach(() => {
    paper.remove();
  });

  describe('_renderPlotArea()', () => {
    it('should render line, default plot type when options.showLine property is not exist.', () => {
      plot.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      spyOn(plot, '_renderPlotLines');

      plot._renderPlotArea('plotContainer');

      expect(plot._renderPlotLines).toHaveBeenCalledWith('plotContainer', {
        width: 400,
        height: 300
      });
    });

    it('should not call _renderLines() if options.showLine is false.', () => {
      plot.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      spyOn(plot, '_renderPlotLines');
      plot.options = {
        showLine: false
      };

      plot._renderPlotArea('plotContainer');

      expect(plot._renderPlotLines).not.toHaveBeenCalled();
    });

    it('if line type chart, execute _renderOptionalLines function', () => {
      plot.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      spyOn(plot, '_renderOptionalLines');
      plot.chartType = chartConst.CHART_TYPE_LINE;
      plot.options = {
        showLine: false
      };
      plot._renderPlotArea('plotContainer');

      expect(plot._renderOptionalLines).toHaveBeenCalledWith('plotContainer', {
        width: 400,
        height: 300
      });
    });
  });

  describe('animateForAddingData()', () => {
    it('Animate must occur three times, including the line and bands options.', () => {
      plot.optionalLines = [{}];
      plot.optionalBands = [[{}], [{}]];
      spyOn(plot.dataProcessor, 'isCoordinateType').and.returnValue(false);
      spyOn(plot, '_animateItemForAddingData');
      plot.animateForAddingData({ shifting: true });

      expect(plot._animateItemForAddingData.calls.count()).toBe(3);
    });
  });

  describe('_renderHorizontalLines()', () => {
    it('draw only one line at the top when have only one position.', () => {
      plot.plotSet = paper.set();
      spyOn(plot.paper, 'path').and.returnValue({ attr: () => {} });
      spyOn(plot, '_makeVerticalPositions').and.returnValue([300]);

      plot.layout = {
        dimension: { width: 400, height: 300 },
        position: { top: 5, left: 5 }
      };

      plot._renderHorizontalLines({ height: 30 });

      expect(plot.paper.path.calls.mostRecent().args[0]).toBe('M5,5H405');
    });
  });

  describe('_createOptionalLineValueRange()', () => {
    it('create value range for optional line, when optionalLineData has range property', () => {
      const optionalLineData = {
        range: [10, 20]
      };
      const actual = plot._createOptionalLineValueRange(optionalLineData);

      expect(actual).toEqual([10, 20]);
    });

    it('create value range for optional line, when optionalLineData has value property', () => {
      const optionalLineData = {
        value: 10
      };
      const actual = plot._createOptionalLineValueRange(optionalLineData);

      expect(actual).toEqual([10]);
    });

    it('create value range for optional line, when xAxisType is datetime type', () => {
      const optionalLineData = {
        range: ['01/01/2016', '01/03/2016']
      };

      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      const actual = plot._createOptionalLineValueRange(optionalLineData);

      expect(actual).toEqual([new Date('01/01/2016').getTime(), new Date('01/03/2016').getTime()]);
    });
  });

  describe('_createOptionalLinePosition()', () => {
    it('create position for optional line, when value axis', () => {
      const xAxisData = {
        dataMin: 20,
        distance: 200
      };
      const actual = plot._createOptionalLinePosition(xAxisData, 400, 120);

      expect(actual).toBe(200);
    });

    it('create position for optional line, when value axis and has maximum value', () => {
      const xAxisData = {
        dataMin: 20,
        distance: 200
      };
      const actual = plot._createOptionalLinePosition(xAxisData, 400, 220);

      expect(actual).toBe(399);
    });
  });

  describe('_createOptionalLinePositionWhenLabelAxis()', () => {
    beforeEach(() => {
      dataProcessor.categoriesMap = {
        x: ['cate1', 'cate2', 'cate3', 'cate4']
      };
    });

    it('create position for optional line, when label axis', () => {
      const actual = plot._createOptionalLinePositionWhenLabelAxis(
        300,
        {
          tickCount: 4
        },
        'cate2'
      );

      expect(actual).toBe(100);
    });

    it('create position for optional line, when label axis and has last value', () => {
      const actual = plot._createOptionalLinePositionWhenLabelAxis(
        300,
        {
          tickCount: 4
        },
        'cate4'
      );

      expect(actual).toBe(299);
    });

    it('create position for optional line, when exist pointOnColumn option', () => {
      plot.dataProcessor.chartType = 'line';

      const actual = plot._createOptionalLinePositionWhenLabelAxis(
        300,
        {
          tickCount: 5,
          options: {
            pointOnColumn: true
          }
        },
        'cate4'
      );

      expect(actual).toBe(262.5);
    });

    it('if has not included value in categories, returns null', () => {
      const actual = plot._createOptionalLinePositionWhenLabelAxis(300, 'cate5');

      expect(actual).toBeNull();
    });
  });

  describe('_createOptionalLinePositionMap()', () => {
    it('create position map for optional line, when x axis is label type', () => {
      const optionalLineData = {
        range: ['cate2', 'cate3']
      };
      const xAxisData = {
        isLabelAxis: true,
        dataMin: 20,
        distance: 200
      };
      dataProcessor.categoriesMap = {
        x: ['cate1', 'cate2', 'cate3', 'cate4']
      };

      const actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

      expect(actual).toEqual({
        start: 100,
        end: 200
      });
    });

    it('create position map for optional line, when x axis is label type and first value in range not included in categories', () => {
      const optionalLineData = {
        range: ['cate0', 'cate3']
      };
      const xAxisData = {
        isLabelAxis: true
      };

      dataProcessor.categoriesMap = {
        x: ['cate1', 'cate2', 'cate3', 'cate4']
      };

      const actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 300);

      expect(actual).toEqual({
        start: -1,
        end: 200
      });
    });

    it('create position map for optional line, when x axis is value type', () => {
      const optionalLineData = {
        range: [170, 220]
      };
      const xAxisData = {
        isLabelAxis: false,
        dataMin: 20,
        distance: 200
      };
      const actual = plot._createOptionalLinePositionMap(optionalLineData, xAxisData, 400);

      expect(actual).toEqual({
        start: 300,
        end: 399
      });
    });
  });

  describe('_makeVerticalPositions()', () => {
    it('make positions for vertical line', () => {
      plot.axisDataMap = {
        yAxis: {
          validTickCount: 5
        }
      };
      const positions = plot._makeVerticalPositions(200);
      expect(positions).toEqual([50, 100, 150, 199]);
    });

    it('if yAxis.validTickCount is zero, returns empty array', () => {
      plot.axisDataMap = {
        yAxis: {
          validTickCount: 0
        }
      };
      const actual = plot._makeVerticalPositions(200);

      expect(actual).toEqual([]);
    });
  });

  describe('_makeDividedPlotPositions()', () => {
    it('make divided positions of plot', () => {
      plot.dimensionMap = {
        yAxis: {
          width: 50
        }
      };

      const actual = plot._makeDividedPlotPositions(450, 8);
      const expected = [0, 50, 100, 150, 300, 350, 400, 449];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeHorizontalPositions()', () => {
    it('make positions for horizontal line', () => {
      plot.axisDataMap = {
        xAxis: {
          validTickCount: 5
        }
      };

      const actual = plot._makeHorizontalPositions(200);

      expect(actual).toEqual([50, 100, 150, 199]);
    });

    it('if xAxis.validTickCount is zero, returns empty array', () => {
      plot.axisDataMap = {
        xAxis: {
          validTickCount: 0
        }
      };

      const actual = plot._makeHorizontalPositions(200);

      expect(actual).toEqual([]);
    });

    it('if divided option is true, returns result to executing _makeDividedPlotPositions() function', () => {
      plot.dimensionMap = {
        yAxis: {
          width: 50
        }
      };
      plot.axisDataMap = {
        xAxis: {
          validTickCount: 5
        }
      };
      plot.options.divided = true;

      const actual = plot._makeHorizontalPositions(350);
      const expected = plot._makeDividedPlotPositions(350, 5);

      expect(actual).toEqual(expected);
    });
  });

  describe('render()', () => {
    it('render for plot area', () => {
      const data = {
        layout: {
          dimension: {
            width: 400,
            height: 200
          },
          position: {
            top: 5,
            left: 5
          }
        },
        axisDataMap: {
          yAxis: {
            validTickCount: 5
          },
          xAxis: {
            validTickCount: 0
          }
        },
        paper
      };

      plot.render(data);

      expect(plot.plotSet.length).toBe(4);

      data.paper.remove();
    });
  });

  describe('_makeRangeTo2DArray()', () => {
    it('should not change optionalLineData.range, when optionalLineData is 2D array', () => {
      const optionalLineData = {
        range: [
          [110, 180],
          [170, 220]
        ]
      };
      plot._makeRangeTo2DArray(optionalLineData);

      expect(optionalLineData.range).toEqual([
        [110, 180],
        [170, 220]
      ]);
    });

    it('should change optionalLineData.range to 2D array, when optionalLineData is 1D array', () => {
      const optionalLineData = {
        range: [110, 180]
      };
      plot._makeRangeTo2DArray(optionalLineData);

      expect(optionalLineData.range).toEqual([[110, 180]]);
    });

    it('should not change optionalLineData.range, when optionalLineData is 1D array and empty', () => {
      const optionalLineData = {};

      plot._makeRangeTo2DArray(optionalLineData);

      expect(optionalLineData.range).toBeUndefined();
    });

    it('should not change, when optionalLineData.range is not an array', () => {
      const optionalLineData = {};

      optionalLineData.range = 'string';
      plot._makeRangeTo2DArray(optionalLineData);
      expect(optionalLineData.range).toBe('string');

      optionalLineData.range = 0.1;
      plot._makeRangeTo2DArray(optionalLineData);
      expect(optionalLineData.range).toBe(0.1);
    });
  });

  describe('_mergeOverlappingPositionMaps()', () => {
    /* eslint-disable object-property-newline */
    it('should merge positionMap, when some areas are overlapped', () => {
      const positionMaps = [
        { start: 110, end: 140 },
        { start: 130, end: 150 },
        { start: 150, end: 160 },
        { start: 170, end: 190 },
        { start: 180, end: 200 }
      ];

      const actual = plot._mergeOverlappingPositionMaps(positionMaps);

      expect(actual).toEqual([
        { start: 110, end: 160 },
        { start: 170, end: 200 }
      ]);
    });

    it('should merge positionMap, when startPosition is all same, but end position is different', () => {
      const positionMaps = [
        { start: 110, end: 140 },
        { start: 110, end: 110 }
      ];

      const actual = plot._mergeOverlappingPositionMaps(positionMaps);

      expect(actual).toEqual([{ start: 110, end: 140 }]);
    });

    it('should not merge positionMap, when all areas are not overlapped', () => {
      const positionMaps = [
        { start: 110, end: 120 },
        { start: 130, end: 150 },
        { start: 170, end: 200 },
        { start: 210, end: 220 }
      ];

      const actual = plot._mergeOverlappingPositionMaps(positionMaps);

      expect(actual).toEqual([
        { start: 110, end: 120 },
        { start: 130, end: 150 },
        { start: 170, end: 200 },
        { start: 210, end: 220 }
      ]);
    });
    /* eslint-enable object-property-newline */
  });

  describe('_isBeforeVisibleValues()', () => {
    const originalCategories = [
      1398870000000,
      1401548400000,
      1404140400000,
      1406818800000,
      1409497200000
    ];
    let result;

    beforeEach(() => {
      plot.xAxisTypeOption = '';
      plot.dataProcessor.originalRawData = {
        categories: originalCategories
      };
    });

    it('should return true, when type is datetime and value is smaller than first visible categories', () => {
      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      result = plot._isBeforeVisibleValue(1388502000000, 1404140400000);

      expect(result).toBe(true);
    });

    it('should return false, when type is datetime and value is same or bigger than first visible categories', () => {
      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      result = plot._isBeforeVisibleValue(1409497200000, 1404140400000);

      expect(result).toBe(false);
    });

    it('should return false, when type is datetime and value is empty', () => {
      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      result = plot._isBeforeVisibleValue(null, 1404140400000);

      expect(result).toBe(false);
    });

    it('should return true, when category index is smaller than first visible', () => {
      result = plot._isBeforeVisibleValue(1398870000000, 1404140400000);

      expect(result).toBe(true);
    });

    it('should return false, when category index is same or bigger than first visible', () => {
      result = plot._isBeforeVisibleValue(1409497200000, 1404140400000);

      expect(result).toBe(false);
    });
  });

  describe('_isAfterVisibleValue()', () => {
    let result;

    beforeEach(() => {
      plot.xAxisTypeOption = '';
      plot.dataProcessor.originalRawData = {
        categories: [1398870000000, 1401548400000, 1404140400000, 1406818800000, 1409497200000]
      };
    });

    it('should return true, when type is datetime and value is bigger than last visible categories', () => {
      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      result = plot._isAfterVisibleValue(1427814000000, 1404140400000);

      expect(result).toBe(true);
    });

    it('should return false, when type is datetime and value is smaller than last visible categories', () => {
      plot.xAxisTypeOption = chartConst.AXIS_TYPE_DATETIME;
      result = plot._isAfterVisibleValue(1388502000000, 1404140400000);

      expect(result).toBe(false);
    });

    it('should return true, when category index is bigger than last visible', () => {
      result = plot._isAfterVisibleValue(1409497200000, 1404140400000);

      expect(result).toBe(true);
    });

    it('should return false, when category index is same or less than last visible', () => {
      result = plot._isAfterVisibleValue(1398870000000, 1404140400000);

      expect(result).toBe(false);
    });
  });

  describe('presetForChangeData()', () => {
    const theme = {
      label: {
        fontFamily: 'Verdana',
        fontSize: 11,
        fontWeight: 'normal'
      },
      colors: ['blue']
    };

    it('theme should be reflected.', () => {
      plot.presetForChangeData(theme);

      expect(plot.theme).toEqual(theme);
    });
  });
});
