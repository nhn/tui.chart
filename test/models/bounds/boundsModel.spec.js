/**
 * @fileoverview Test for BoundsModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import BoundsModel from '../../../src/js/models/bounds/boundsModel';
import chartConst from '../../../src/js/const';
import renderUtil from '../../../src/js/helpers/renderUtil';
import raphaelRenderUtil from '../../../src/js/plugins/raphaelRenderUtil';

describe('Test for BoundsModel', () => {
  let boundsModel, dataProcessor;

  beforeAll(() => {
    // Spy to produce consistence results
    // Because calculated width and hight might be differ for each browsers
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(raphaelRenderUtil, 'getRenderedTextSize').and.returnValue(50);
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getFormattedMaxValue',
      'getFormatFunctions',
      'getGroupValues',
      'getWholeGroupValues',
      'getLegendData',
      'getCategories',
      'getFormattedGroupValues',
      'getLegendLabels',
      'getMultilineCategories',
      'getMultilineCategories'
    ]);
    dataProcessor.getFormatFunctions.and.returnValue([]);
  });

  beforeEach(() => {
    spyOn(renderUtil, 'getRenderedLabelHeight');
    boundsModel = new BoundsModel({
      dataProcessor,
      options: {
        legend: {
          visible: true
        },
        chart: {
          title: {
            text: 'This is title'
          }
        },
        chartExportMenu: {
          visible: true
        }
      },
      theme: {
        title: {
          fontSize: 16,
          fontFamily: 'Verdana'
        }
      }
    });
  });

  describe('_registerChartDimension()', () => {
    it('should register chart dimension from chart option(width, height)', () => {
      boundsModel.options.chart = {
        width: 300,
        height: 200
      };
      boundsModel._registerChartDimension();
      const actual = boundsModel.getDimension('chart');
      const expected = {
        width: 300,
        height: 200
      };

      expect(actual).toEqual(expected);
    });

    it('should register default dimension when there is no chart option.', () => {
      boundsModel._registerChartDimension();
      const actual = boundsModel.getDimension('chart');
      const expected = {
        width: chartConst.CHART_DEFAULT_WIDTH,
        height: chartConst.CHART_DEFAULT_HEIGHT
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_registerTitleDimension()', () => {
    it('should register title dimension.', () => {
      raphaelRenderUtil.getRenderedTextSize.and.returnValue({
        height: 40
      });
      boundsModel._registerTitleDimension();
      const actual = boundsModel.getDimension('title');
      const expected = {
        height: 60
      };

      expect(actual).toEqual(expected);
    });
    it('should register 0 dimension, if not have title option title.', () => {
      boundsModel = new BoundsModel({
        dataProcessor,
        options: {
          legend: {
            visible: true
          },
          chart: {},
          chartExportMenu: {
            visible: true
          }
        }
      });

      renderUtil.getRenderedLabelHeight.and.returnValue(20);
      boundsModel._registerTitleDimension();
      const actual = boundsModel.getDimension('title');
      const expected = {
        height: 0
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_registerChartExportMenuDimension()', () => {
    it('should register chartExportMenu dimension.', () => {
      boundsModel._registerChartExportMenuDimension();
      const actual = boundsModel.getDimension('chartExportMenu');
      const expected = {
        height: 34,
        width: 24
      };

      expect(actual).toEqual(expected);
    });
    it('should register 0 dimension, if chartExportMenu option is not exist', () => {
      boundsModel = new BoundsModel({
        dataProcessor,
        options: {
          legend: {
            visible: true
          },
          chart: {},
          chartExportMenu: {
            visible: false
          }
        }
      });

      boundsModel._registerChartExportMenuDimension();
      const actual = boundsModel.getDimension('chartExportMenu');
      const expected = {
        height: 0,
        width: 0
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_updateDimensionsWidth()', () => {
    it('update dimensions width', () => {
      boundsModel.chartLeftPadding = 10;
      boundsModel.dimensionMap = {
        plot: {
          width: 200
        },
        series: {
          width: 199
        },
        mouseEventDetector: {
          width: 199
        },
        xAxis: {
          width: 200
        }
      };

      boundsModel.chartLeftPadding = 10;

      boundsModel._updateDimensionsWidth({
        overflowLeft: 50,
        overflowRight: 10
      });

      expect(boundsModel.chartLeftPadding).toBe(60);
      expect(boundsModel.getDimension('plot').width).toBe(140);
      expect(boundsModel.getDimension('series').width).toBe(139);
      expect(boundsModel.getDimension('mouseEventDetector').width).toBe(139);
      expect(boundsModel.getDimension('xAxis').width).toBe(140);
    });
  });

  describe('_updateDimensionsHeight()', () => {
    it('should increase plot.height, series.height by 50, and descrease xAxis.heigth by 50.', () => {
      boundsModel.dimensionMap = {
        plot: {
          height: 200
        },
        series: {
          height: 200
        },
        mouseEventDetector: {
          height: 200
        },
        tooltip: {
          height: 200
        },
        xAxis: {
          height: 50
        },
        yAxis: {
          height: 200
        },
        rightYAxis: {
          height: 200
        }
      };
      boundsModel._updateDimensionsHeight(50);

      expect(boundsModel.getDimension('plot').height).toBe(150);
      expect(boundsModel.getDimension('series').height).toBe(150);
      expect(boundsModel.getDimension('mouseEventDetector').height).toBe(150);
      expect(boundsModel.getDimension('tooltip').height).toBe(150);
      expect(boundsModel.getDimension('xAxis').height).toBe(100);
      expect(boundsModel.getDimension('yAxis').height).toBe(150);
      expect(boundsModel.getDimension('rightYAxis').height).toBe(150);
    });
  });

  describe('_makePlotDimension()', () => {
    it('should make plot dimension from series dimension by adding hidden height 1', () => {
      boundsModel.dimensionMap.series = {
        width: 200,
        height: 100
      };

      const actual = boundsModel._makePlotDimension();
      const expected = {
        width: 200,
        height: 101
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_registerAxisComponentsDimension()', () => {
    it('should register component dimension from plot dimension', () => {
      spyOn(boundsModel, '_makePlotDimension').and.returnValue({
        width: 300,
        height: 200
      });
      boundsModel._registerAxisComponentsDimension();

      expect(boundsModel.getDimension('plot').width).toBe(300);
      expect(boundsModel.getDimension('plot').height).toBe(200);
      expect(boundsModel.getDimension('xAxis').width).toBe(300);
      expect(boundsModel.getDimension('yAxis').height).toBe(200);
      expect(boundsModel.getDimension('rightYAxis').height).toBe(200);
    });
  });

  describe('_makeSeriesDimension()', () => {
    it('should make series dimesion using dimension of virtical legend, series', () => {
      boundsModel.dimensionMap = {
        chart: {
          width: 500,
          height: 400
        },
        title: {
          height: 50
        },
        legend: {
          width: 50
        },
        xAxis: {
          height: 50
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        },
        chartExportMenu: {
          height: 0
        }
      };

      const actual = boundsModel._makeSeriesDimension();
      const expected = {
        width: 380,
        height: 280
      };

      expect(actual).toEqual(expected);
    });

    it('should calculate series dimension using horizontal legend width.', () => {
      boundsModel.dimensionMap = {
        chart: {
          width: 500,
          height: 400
        },
        title: {
          height: 50
        },
        legend: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        },
        chartExportMenu: {
          height: 0
        }
      };
      boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_TOP;

      const actual = boundsModel._makeSeriesDimension();
      const expected = {
        width: 430,
        height: 250
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_registerCenterComponentsDimension()', () => {
    it('should register tooltip and event detector dimension from series dimension.', () => {
      boundsModel.dimensionMap = {
        series: {
          width: 300,
          height: 200
        }
      };
      boundsModel._registerCenterComponentsDimension();

      expect(boundsModel.getDimension('tooltip').width).toBe(300);
      expect(boundsModel.getDimension('tooltip').height).toBe(200);
      expect(boundsModel.getDimension('mouseEventDetector').width).toBe(300);
      expect(boundsModel.getDimension('mouseEventDetector').height).toBe(200);
    });
  });

  describe('_registerAxisComponentsPosition()', () => {
    it('should set position related to axis using dimension of series, leftLegendWidth, yAxis.', () => {
      const leftLegendWidth = 0;

      boundsModel.dimensionMap.series = {
        width: 300,
        height: 200
      };
      boundsModel.dimensionMap.yAxis = {
        width: 30
      };
      boundsModel.positionMap.series = {
        left: 50,
        top: 50
      };

      boundsModel._registerAxisComponentsPosition(leftLegendWidth);

      expect(boundsModel.getPosition('plot').top).toBe(50);
      expect(boundsModel.getPosition('plot').left).toBe(50);
      expect(boundsModel.getPosition('yAxis').top).toBe(50);
      expect(boundsModel.getPosition('yAxis').left).toBe(10);
      expect(boundsModel.getPosition('xAxis').top).toBe(250);
      expect(boundsModel.getPosition('xAxis').left).toBe(50);
      expect(boundsModel.getPosition('rightYAxis').top).toBe(50);
      expect(boundsModel.getPosition('rightYAxis').left).toBe(339);
    });
  });

  describe('_makeLegendPosition()', () => {
    it('should make legend position of default align(left).', () => {
      boundsModel.dimensionMap = {
        title: {
          height: 20
        },
        yAxis: {
          width: 30
        },
        series: {
          width: 200
        },
        rightYAxis: {
          width: 30
        },
        legend: {
          width: 50
        }
      };
      boundsModel.positionMap.series = {
        left: 20,
        top: 50
      };
      const actual = boundsModel._makeLegendPosition();
      const expected = {
        top: 60,
        left: 270
      };

      expect(actual).toEqual(expected);
    });

    it('should make legend position of bottom align.', () => {
      boundsModel.dimensionMap = {
        title: {
          height: 20
        },
        xAxis: {
          height: 30
        },
        yAxis: {
          width: 30
        },
        series: {
          width: 200
        },
        rightYAxis: {
          width: 30
        },
        legend: {
          width: 50
        }
      };
      boundsModel.positionMap.series = {
        left: 20,
        top: 50
      };
      const actual = boundsModel._makeLegendPosition();
      const expected = {
        top: 60,
        left: 270
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeCircleLegendPosition()', () => {
    it('should calculate left position of circle legend using width fo series, circle legend, legend', () => {
      boundsModel.positionMap = {
        series: {
          left: 40
        }
      };
      boundsModel.dimensionMap = {
        series: {
          width: 400
        },
        circleLegend: {
          width: 100
        },
        legend: {
          width: 120
        }
      };

      const actual = boundsModel._makeCircleLegendPosition().left;
      const expected = 455;

      expect(actual).toBe(expected);
    });

    it('should calculate left position of circle legend, using width of circle legend and legend, when circle aligns left.', () => {
      boundsModel.options.legend.align = chartConst.LEGEND_ALIGN_LEFT;

      boundsModel.positionMap = {
        series: {}
      };
      boundsModel.dimensionMap = {
        series: {},
        circleLegend: {
          width: 100
        },
        legend: {
          width: 120
        }
      };

      const actual = boundsModel._makeCircleLegendPosition().left;
      const expected = 15;

      expect(actual).toBe(expected);
    });

    it('should calculate left position using series.left and series.width, when horizontal circle legend', () => {
      boundsModel.positionMap = {
        series: {
          left: 40
        }
      };
      boundsModel.dimensionMap = {
        series: {
          width: 400
        },
        circleLegend: {}
      };
      boundsModel.options = {
        legend: {
          align: 'top'
        }
      };

      const actual = boundsModel._makeCircleLegendPosition().left;
      const expected = 440;

      expect(actual).toBe(expected);
    });

    it('should calculate left position using series.left and series.width, when circle legend is hidden.', () => {
      boundsModel.positionMap = {
        series: {
          left: 40
        }
      };
      boundsModel.dimensionMap = {
        series: {
          width: 400
        },
        circleLegend: {}
      };
      boundsModel.options = {
        legend: {
          visible: false
        }
      };

      const actual = boundsModel._makeCircleLegendPosition().left;
      const expected = 440;

      expect(actual).toBe(expected);
    });

    it('should set circleLegend.top to position.top + series.height - circleLegend.height.', () => {
      boundsModel.positionMap = {
        series: {
          top: 60
        }
      };
      boundsModel.dimensionMap = {
        series: {
          height: 300
        },
        circleLegend: {
          height: 80
        },
        legend: {}
      };

      const actual = boundsModel._makeCircleLegendPosition().top;
      const expected = 280;

      expect(actual).toBe(expected);
    });
  });

  describe('_registerEssentialComponentsPositions()', () => {
    it('should set position of event detector and legend, tooltip using series position.', () => {
      spyOn(boundsModel, '_makeLegendPosition').and.returnValue({
        top: 30,
        left: 250
      });

      boundsModel.chartType = 'bar';
      boundsModel.hasAxes = true;
      boundsModel.positionMap.series = {
        left: 50,
        top: 50
      };
      boundsModel._registerEssentialComponentsPositions();

      expect(boundsModel.getPosition('mouseEventDetector').top).toBe(50);
      expect(boundsModel.getPosition('mouseEventDetector').left).toBe(50);
      expect(boundsModel.getPosition('legend').top).toBe(30);
      expect(boundsModel.getPosition('legend').left).toBe(250);
      expect(boundsModel.getPosition('tooltip').top).toBe(40);
      expect(boundsModel.getPosition('tooltip').left).toBe(40);
    });
  });

  describe('_updateBoundsForYAxisCenterOption()', () => {
    it('should update bounds for center align yAxis.', () => {
      spyOn(renderUtil, 'isOldBrowser').and.returnValue(false);
      boundsModel.dimensionMap = {
        extendedSeries: {
          width: 300
        },
        xAxis: {
          width: 300
        },
        plot: {
          width: 300
        },
        mouseEventDetector: {
          width: 300
        },
        tooltip: {
          width: 300
        }
      };
      boundsModel.positionMap = {
        series: {
          left: 50
        },
        extendedSeries: {
          left: 50
        },
        plot: {
          left: 50
        },
        yAxis: {
          left: 50
        },
        xAxis: {
          left: 50
        },
        mouseEventDetector: {
          left: 50
        },
        tooltip: {
          left: 50
        }
      };

      boundsModel.dimensionMap.yAxis = {
        width: 50
      };
      boundsModel.dimensionMap.series = {
        width: 300
      };

      boundsModel._updateBoundsForYAxisCenterOption();

      expect(boundsModel.dimensionMap.extendedSeries.width).toBe(350);
      expect(boundsModel.dimensionMap.xAxis.width).toBe(301);
      expect(boundsModel.dimensionMap.plot.width).toBe(351);
      expect(boundsModel.dimensionMap.mouseEventDetector.width).toBe(350);
      expect(boundsModel.dimensionMap.tooltip.width).toBe(350);

      expect(boundsModel.positionMap.series.left).toBe(0);
      expect(boundsModel.positionMap.extendedSeries.left).toBe(1);
      expect(boundsModel.positionMap.plot.left).toBe(1);
      expect(boundsModel.positionMap.yAxis.left).toBe(201);
      expect(boundsModel.positionMap.xAxis.left).toBe(1);
      expect(boundsModel.positionMap.mouseEventDetector.left).toBe(1);
      expect(boundsModel.positionMap.tooltip.left).toBe(1);
    });

    it('should add series.left and extendedSeries.left by 1 for older browsers(IE7, IE8)', () => {
      spyOn(renderUtil, 'isOldBrowser').and.returnValue(true);
      boundsModel.dimensionMap = {
        extendedSeries: {
          width: 300
        },
        xAxis: {
          width: 300
        },
        plot: {
          width: 300
        },
        mouseEventDetector: {
          width: 300
        },
        tooltip: {
          width: 300
        }
      };
      boundsModel.positionMap = {
        series: {
          left: 50
        },
        extendedSeries: {
          left: 50
        },
        plot: {
          left: 50
        },
        yAxis: {
          left: 50
        },
        xAxis: {
          left: 50
        },
        mouseEventDetector: {
          left: 50
        },
        tooltip: {
          left: 50
        }
      };

      boundsModel.dimensionMap.yAxis = {
        width: 50
      };
      boundsModel.dimensionMap.series = {
        width: 300
      };

      boundsModel._updateBoundsForYAxisCenterOption();

      expect(boundsModel.positionMap.series.left).toBe(1);
      expect(boundsModel.positionMap.extendedSeries.left).toBe(2);
    });
  });

  describe('_updateLegendAndSeriesWidth()', () => {
    it('update legend width, when has width for vertical type legend', () => {
      boundsModel.dimensionMap.series = {
        width: 300
      };
      boundsModel.dimensionMap.legend = {
        width: 0
      };
      boundsModel.options.legend = {
        visible: true,
        align: chartConst.LEGEND_ALIGN_LEFT
      };

      boundsModel._updateLegendAndSeriesWidth(80, 20);

      expect(boundsModel.getDimension('legend').width).toBe(80);
    });

    it('update legend width, when has not width for vertical type legend', () => {
      boundsModel.dimensionMap.series = {
        width: 300
      };
      boundsModel.dimensionMap.legend = {
        width: 0
      };
      boundsModel.options.legend = {
        visible: true,
        align: chartConst.LEGEND_ALIGN_TOP
      };

      boundsModel._updateLegendAndSeriesWidth(80, 20);

      expect(boundsModel.getDimension('legend').width).toBe(0);
    });

    it('update series width', () => {
      boundsModel.dimensionMap.series = {
        width: 300
      };

      boundsModel._updateLegendAndSeriesWidth(80, 20);

      expect(boundsModel.getDimension('series').width).toBe(280);
    });
  });

  describe('getBaseSizeForLimit()', () => {
    it('should return series.width to default size, when value axis is x.', () => {
      spyOn(boundsModel, 'calculateSeriesWidth').and.returnValue(400);

      const actual = boundsModel.getBaseSizeForLimit();
      const expected = 400;

      expect(actual).toBe(expected);
    });

    it('should set series.height to default size, when value axis is y.', () => {
      spyOn(boundsModel, 'calculateSeriesHeight').and.returnValue(300);

      const actual = boundsModel.getBaseSizeForLimit(true);
      const expected = 300;

      expect(actual).toBe(expected);
    });
  });
});
