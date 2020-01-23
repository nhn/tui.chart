/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import LineTypeSeriesBase from '../../../src/js/components/series/lineTypeSeriesBase';
import Series from '../../../src/js/components/series/series.js';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import renderUtil from '../../../src/js/helpers/renderUtil';
import dom from '../../../src/js/helpers/domHandler.js';
import raphael from 'raphael';

describe('LineTypeSeriesBase', () => {
  let series, dataProcessor;

  beforeAll(() => {
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getFirstItemLabel',
      'isCoordinateType'
    ]);
    series = new LineTypeSeriesBase();
    series.dataProcessor = dataProcessor;
    series._getSeriesDataModel = jasmine.createSpy('_getSeriesDataModel');
    series.layout = {
      dimension: {
        width: 300,
        height: 200
      },
      position: {
        top: 0,
        left: 0
      }
    };
  });

  describe('_renderSeriesLabel()', () => {
    const paper = raphael(dom.create('div'), 100, 100);
    const seriesDataModel = new SeriesDataModel();

    beforeEach(() => {
      spyOn(series, '_getLabelPositions').and.returnValue({});

      series.decorateLabel = Series.prototype.decorateLabel;
      series.theme = {};
      series.options = {};

      series.graphRenderer = {
        renderSeriesLabel: jasmine.createSpy('renderSeriesLabel')
      };
      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.groups = [
        new SeriesGroup([
          {
            endLabel: '-1.5'
          },
          {
            endLabel: '-2.2'
          }
        ])
      ];

      series.seriesData = {
        groupBounds: [[{ end: {} }, { end: {} }]]
      };
    });

    it('labelPrefix option should be applied.', () => {
      series.options.showLabel = true;
      series.options.labelPrefix = '^';

      series._renderSeriesLabel(paper);

      expect(series.graphRenderer.renderSeriesLabel.calls.mostRecent().args[2][0][0].end).toBe(
        '^-1.5'
      );
    });

    it('labelSuffix option should be applied.', () => {
      series.options.showLabel = true;
      series.options.labelSuffix = '$';

      series._renderSeriesLabel(paper);

      expect(series.graphRenderer.renderSeriesLabel.calls.mostRecent().args[2][0][0].end).toBe(
        '-1.5$'
      );
    });
  });

  describe('_makePositionsForDefaultType()', () => {
    it('make positions for default data type, when not aligned.', () => {
      const seriesDataModel = new SeriesDataModel();

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratio: 0.25
          },
          {
            ratio: 0.5
          },
          {
            ratio: 0.4
          }
        ])
      ];
      spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
      series.axisDataMap = {
        xAxis: {}
      };
      series.aligned = false;

      const actual = series._makePositionsForDefaultType();

      expect(actual).toEqual([
        [
          {
            top: 150,
            left: 50
          },
          {
            top: 100,
            left: 150
          },
          {
            top: 120,
            left: 250
          }
        ]
      ]);
    });

    it('should not create position when serieItem.end equals null.', () => {
      const seriesDataModel = new SeriesDataModel();
      const expected = [[]];

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratio: 0.25,
            end: null
          },
          {
            ratio: 0.5
          },
          {
            ratio: 0.4
          }
        ])
      ];
      spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
      series.axisDataMap = {
        xAxis: {}
      };
      series.aligned = false;
      const actual = series._makePositionsForDefaultType();

      expected[0][1] = {
        top: 100,
        left: 150
      };
      expected[0][2] = {
        top: 120,
        left: 250
      };
      expect(actual).toEqual(expected);
    });

    it('make positions for default data type, when aligned & single data', () => {
      const seriesDataModel = new SeriesDataModel();

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratio: 0.25
          }
        ])
      ];
      spyOn(seriesDataModel, 'getGroupCount').and.returnValue(1);
      series.aligned = true;
      series.layout = {
        dimension: {
          width: 300,
          height: 200
        },
        position: {
          top: 10,
          left: 10
        }
      };
      series.axisDataMap = {
        xAxis: {}
      };

      const actual = series._makePositionsForDefaultType();

      expect(actual).toEqual([
        [
          {
            top: 160,
            left: 10
          }
        ]
      ]);
    });

    it('make positions for default data type, when aligned & single null data', () => {
      const seriesDataModel = new SeriesDataModel();

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratio: 0.25,
            end: null
          }
        ])
      ];
      spyOn(seriesDataModel, 'getGroupCount').and.returnValue(1);
      series.aligned = true;
      series.layout = {
        dimension: {
          width: 300,
          height: 200
        },
        position: {
          top: 10,
          left: 10
        }
      };
      series.axisDataMap = {
        xAxis: {}
      };

      const actual = series._makePositionsForDefaultType();

      expect(actual.length).toBe(1);
      expect(actual[0].length).toBe(1);
      expect(actual[0][0]).toBeUndefined();
    });

    it('make positions for default data type, when aligned & null', () => {
      const seriesDataModel = new SeriesDataModel();

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratio: 0.25
          },
          {
            ratio: 0.5
          },
          {
            ratio: 0.4
          }
        ])
      ];
      spyOn(seriesDataModel, 'getGroupCount').and.returnValue(3);
      series.aligned = true;
      series.axisDataMap = {
        xAxis: {}
      };

      const actual = series._makePositionsForDefaultType();

      expect(actual).toEqual([
        [
          {
            top: 150,
            left: 0
          },
          {
            top: 100,
            left: 150
          },
          {
            top: 120,
            left: 300
          }
        ]
      ]);
    });
  });

  describe('_makePositionForCoordinateType()', () => {
    it('make positions for coordinate data type', () => {
      const seriesDataModel = new SeriesDataModel();

      series._getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.pivotGroups = [
        new SeriesGroup([
          {
            ratioMap: {
              x: 0,
              y: 0.2
            }
          },
          {
            ratioMap: {
              x: 0.5,
              y: 0.7
            }
          },
          {
            ratioMap: {
              x: 1,
              y: 0.4
            }
          }
        ])
      ];
      series.layout = {
        dimension: {
          width: 300,
          height: 200
        },
        position: {
          top: 0,
          left: 0
        }
      };
      series.axisDataMap = {
        xAxis: {
          sizeRatio: 0.8,
          positionRatio: 0.08
        }
      };
      const actual = series._makePositionForCoordinateType();

      expect(actual).toEqual([
        [
          {
            top: 160,
            left: 24
          },
          {
            top: 60,
            left: 144
          },
          {
            top: 120,
            left: 264
          }
        ]
      ]);
    });
  });

  describe('_calculateLabelPositionTop()', () => {
    it('should calculate label top position if stack type chart.', () => {
      series.options = {
        stackType: 'normal'
      };

      const actual = series._calculateLabelPositionTop(
        {
          top: 10,
          startTop: 40
        },
        20,
        16
      );
      const expected = 18;

      expect(actual).toBe(expected);
    });

    it('should calculates top when the value is positive and not the starting value, not stack chart', () => {
      series.options = {};

      const actual = series._calculateLabelPositionTop(
        {
          top: 60,
          startTop: 40
        },
        30,
        16
      );
      const expected = 39;

      expect(actual).toBe(expected);
    });

    it('should calculate top when the value is negative and start value, not stack chart', () => {
      series.options = {};

      const actual = series._calculateLabelPositionTop(
        {
          top: 60,
          startTop: 40
        },
        -30,
        16,
        true
      );
      const expected = 39;

      expect(actual).toBe(expected);
    });

    it('should calculate top when the value is positive and start value, not stack chart', () => {
      series.options = {};

      const actual = series._calculateLabelPositionTop(
        {
          top: 10,
          startTop: 40
        },
        30,
        16,
        true
      );
      const expected = 15;

      expect(actual).toBe(expected);
    });

    it('should calculate top when the value is negative and not start value, not stack chart', () => {
      series.options = {};

      const actual = series._calculateLabelPositionTop(
        {
          top: 10,
          startTop: 40
        },
        30,
        16,
        true
      );
      const expected = 15;

      expect(actual).toBe(expected);
    });
  });

  describe('_makeLabelPosition()', () => {
    it('should calculate left using labe.width and basePostion.left', () => {
      spyOn(series, '_calculateLabelPositionTop');
      series.theme = {};
      series.dimensionMap = {
        extendedSeries: {
          width: 200
        }
      };

      const position = series._makeLabelPosition({
        left: 60
      });
      const actual = position.left;
      const expected = 60;

      expect(actual).toBe(expected);
    });

    it('should calculate top using label.width and result of _calculateLabelPositionTop().', () => {
      spyOn(series, '_calculateLabelPositionTop').and.returnValue(50);
      series.theme = {};
      series.dimensionMap = {
        extendedSeries: {
          height: 200
        }
      };

      const position = series._makeLabelPosition({
        left: 60
      });
      const actual = position.top;
      const expected = 50;

      expect(actual).toBe(expected);
    });
  });
});
