/**
 * @fileoverview test pie chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphael from 'raphael';
import snippet from 'tui-code-snippet';
import pieSeriesFactory from '../../../src/js/components/series/pieChartSeries.js';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import dom from '../../../src/js/helpers/domHandler.js';
import renderUtil from '../../../src/js/helpers/renderUtil.js';

describe('PieChartSeries', () => {
  let series, dataProcessor;

  beforeAll(() => {
    // Rendered width, height is different according to browser
    // Spy these functions so that make same test environment
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getLegendLabels',
      'getSeriesDataModel',
      'getFirstItemLabel',
      'isComboDonutShowOuterLabel'
    ]);

    dataProcessor.getLegendLabels.and.returnValue(['legend1', 'legend2', 'legend3']);
    dataProcessor.getFirstItemLabel.and.returnValue('2.2');
  });

  beforeEach(() => {
    series = new pieSeriesFactory.PieChartSeries({
      chartType: 'pie',
      theme: {
        label: {
          fontFamily: 'Verdana',
          fontSize: 11
        }
      },
      options: {},
      dataProcessor,
      eventBus: new snippet.CustomEvents()
    });
    series.layout = {
      position: {
        left: 0,
        top: 0
      }
    };
  });

  describe('_makeValidAngle()', () => {
    it('should convert negative angle to positive angle under 360.', () => {
      const actual = series._makeValidAngle(-90);

      expect(actual).toBe(270);
    });

    it('should convert over 360 angle to under 360 angle', () => {
      const actual = series._makeValidAngle(450);

      expect(actual).toBe(90);
    });

    it('should return default angle if angle is undefined.', () => {
      let angle;
      const defaultAngle = 0;
      const actual = series._makeValidAngle(angle, defaultAngle);

      expect(actual).toBe(0);
    });
  });

  describe('_calculateAngleForRendering()', () => {
    it('should calculate angle by subtracting start angle from end angle, if start angle is larger than end angle.', () => {
      series.options = {
        startAngle: 10,
        endAngle: 90
      };

      const actual = series._calculateAngleForRendering();

      expect(actual).toBe(80);
    });

    it('should calculate angle by (360 - (start - angle)), if start angle is larger than end angle.', () => {
      series.options = {
        startAngle: 90,
        endAngle: 10
      };

      const actual = series._calculateAngleForRendering();

      expect(actual).toBe(280);
    });

    it('should return 360, if start and end angle are same.', () => {
      series.options = {
        startAngle: 90,
        endAngle: 90
      };

      const actual = series._calculateAngleForRendering();

      expect(actual).toBe(360);
    });
  });

  describe('_getQuadrantFromAngle()', () => {
    it('should return 1 if angle is more or same to 0, and less than 90.', () => {
      let actual = series._getQuadrantFromAngle(0);

      expect(actual).toBe(1);

      actual = series._getQuadrantFromAngle(45);

      expect(actual).toBe(1);

      actual = series._getQuadrantFromAngle(90);

      expect(actual).not.toBe(1);
    });

    it('should return 2, if angle is more or same to 90, and less than 180.', () => {
      let actual = series._getQuadrantFromAngle(90);

      expect(actual).toBe(2);

      actual = series._getQuadrantFromAngle(135);

      expect(actual).toBe(2);

      actual = series._getQuadrantFromAngle(180);

      expect(actual).not.toBe(2);
    });

    it('should return 3, if angle is more or same to 180, and less than 270.', () => {
      let actual = series._getQuadrantFromAngle(180);

      expect(actual).toBe(3);

      actual = series._getQuadrantFromAngle(225);

      expect(actual).toBe(3);

      actual = series._getQuadrantFromAngle(270);

      expect(actual).not.toBe(2);
    });

    it('should return 4, if angle is more or same to 270, and less than 360.', () => {
      let actual = series._getQuadrantFromAngle(270);

      expect(actual).toBe(4);

      actual = series._getQuadrantFromAngle(315);

      expect(actual).toBe(4);

      actual = series._getQuadrantFromAngle(360);

      expect(actual).not.toBe(4);
    });

    it('should subtract 1 from original quadrant, if isEnd is true and angle is multiples of 90', () => {
      const isEnd = true;
      let actual = series._getQuadrantFromAngle(90, isEnd);

      expect(actual).toBe(1);

      actual = series._getQuadrantFromAngle(180, isEnd);

      expect(actual).toBe(2);

      actual = series._getQuadrantFromAngle(270, isEnd);

      expect(actual).toBe(3);
    });

    it('should return 4, if isEnd is true and angle is 0.', () => {
      const isEnd = true;
      const actual = series._getQuadrantFromAngle(0, isEnd);

      expect(actual).toBe(4);
    });
  });

  describe('_makeSectorData()', () => {
    it('should create path ratio 0 when seriesItem is null.', () => {
      const seriesDataModel = new SeriesDataModel();

      seriesDataModel.groups = [
        new SeriesGroup([
          null,
          {
            ratio: 0.125
          },
          {
            ratio: 0.1
          },
          {
            ratio: 0.35
          },
          {
            ratio: 0.175
          }
        ])
      ];
      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);

      const actual = series._makeSectorData({
        cx: 100,
        cy: 100,
        r: 100
      });

      expect(actual.length).toBe(5);
      expect(actual[0].ratio).toBe(0);
    });

    it('should create angle, center position, outer position values using percentValues.', () => {
      const seriesDataModel = new SeriesDataModel();

      seriesDataModel.groups = [
        new SeriesGroup([
          {
            ratio: 0.25
          },
          {
            ratio: 0.125
          },
          {
            ratio: 0.1
          },
          {
            ratio: 0.35
          },
          {
            ratio: 0.175
          }
        ])
      ];
      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);

      const actual = series._makeSectorData({
        cx: 300,
        cy: 300,
        r: 150
      });

      expect(actual.length).toBe(5);
      expect(actual[0].ratio).toBe(0.25);
      expect(actual[0].angles.start.startAngle).toBe(0);
      expect(actual[0].angles.start.endAngle).toBe(0);
      expect(actual[0].angles.end.startAngle).toBe(0);
      expect(actual[0].angles.end.endAngle).toBe(90);
      expect(actual[0].centerPosition).toEqual({
        left: 353.03300858899104,
        top: 246.96699141100893
      });
      expect(actual[0].outerPosition).toEqual({
        left: 420.2081528017131,
        top: 179.79184719828692
      });
    });
  });

  describe('_calculateBaseSize()', () => {
    it('should set base size to smaller of twiced height and width, if it is on 2 ~ 3 quadrant.', () => {
      series.layout.dimension = {
        width: 600,
        height: 400
      };
      series.options.startAngle = 120;
      series.options.endAngle = 220;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(600);
    });

    it('should set base size to smaller of twiced height and width, if it is on 4 ~ 1 quadrant.', () => {
      series.layout.dimension = {
        width: 600,
        height: 400
      };
      series.options.startAngle = 320;
      series.options.endAngle = 80;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(600);
    });

    it('should set base size to smaller of height and twiced width, if it is on 1 ~ 2 quadrant.', () => {
      series.layout.dimension = {
        width: 300,
        height: 400
      };
      series.options.startAngle = 0;
      series.options.endAngle = 180;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(400);
    });

    it('should set base size to smaller of height and twiced width, if it is on 3 ~ 4 quadrant.', () => {
      series.layout.dimension = {
        width: 300,
        height: 400
      };
      series.options.startAngle = 180;
      series.options.endAngle = 360;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(400);
    });

    it('should set base size to smaller of twiced width and twiced height, if start quardrant and end quadrant is same.', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 20;
      series.options.endAngle = 80;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(800);
    });

    it('should return smaller of width and height without any calculation, if it is combo chart.', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.isCombo = true;

      const actual = series._calculateBaseSize();

      expect(actual).toBe(400);
    });
  });

  describe('_calculateRadius()', () => {
    it('should calculate radius to min(width, height) * 0.9.', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };

      const actual = series._calculateRadius();

      expect(actual).toBe(180);
    });

    it('should calculate radius to min(width, height) * 0.75, if isShowOuterLabel is true.', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.isShowOuterLabel = true;

      const actual = series._calculateRadius();

      expect(actual).toBe(150);
    });

    it('should calculate pie1 radius to be same to pie2', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.isCombo = true;
      series.seriesType = 'pie1';
      series.isShowOuterLabel = false;
      dataProcessor.isComboDonutShowOuterLabel.and.returnValue(true);

      const actual = series._calculateRadius();

      expect(actual).toBe(150);
    });
  });

  describe('_calculateCenterXY()', () => {
    it('should calculate cx by subtracting half of radius, cy by adding half of radius. if pie sector is only on 1 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 20;
      series.options.endAngle = 80;

      const actual = series._calculateCenterXY(320);

      expect(actual.cx).toEqual(90);
      expect(actual.cy).toEqual(360);
    });

    it('should calculate cx by subtracting half of radius. if pie sector is on 1 ~ 2 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 20;
      series.options.endAngle = 160;

      const actual = series._calculateCenterXY(160);

      expect(actual.cx).toEqual(170);
      expect(actual.cy).toEqual(200);
    });

    it('should calculate cx by subtracting half of radius, cy by substraction half of radius. if pie sector is only on 1 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 110;
      series.options.endAngle = 180;

      const actual = series._calculateCenterXY(320);

      expect(actual.cx).toEqual(90);
      expect(actual.cy).toEqual(40);
    });

    it('should calculate cy by substracting half of radius. if pie sector is on 2 and 3 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 90;
      series.options.endAngle = 270;

      const actual = series._calculateCenterXY(200);

      expect(actual.cx).toEqual(250);
      expect(actual.cy).toEqual(100);
    });

    it('should calculate cx by adding half of radius, cy by substractiong half of radius. if pie sector is only on 3 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 220;
      series.options.endAngle = 250;

      const actual = series._calculateCenterXY(320);

      expect(actual.cx).toEqual(410);
      expect(actual.cy).toEqual(40);
    });

    it('should calculate cx by adding half of radius. if pie sector is on 3 and 4 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 250;
      series.options.endAngle = 350;

      const actual = series._calculateCenterXY(160);

      expect(actual.cx).toEqual(330);
      expect(actual.cy).toEqual(200);
    });

    it('should calculate cy by adding half of radius. if pie sector is on 4 and 1 quadrant.', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 280;
      series.options.endAngle = 50;

      const actual = series._calculateCenterXY(200);

      expect(actual.cx).toEqual(250);
      expect(actual.cy).toEqual(300);
    });

    it('should calculate cx, cy by adding half of radius, if pie sector is on 4 quadrant', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.options.startAngle = 270;
      series.options.endAngle = 360;

      const actual = series._calculateCenterXY(320);

      expect(actual.cx).toEqual(410);
      expect(actual.cy).toEqual(360);
    });

    it('should return cx, cy without any calculation, if it is combo chart', () => {
      series.layout.dimension = {
        width: 500,
        height: 400
      };
      series.isCombo = true;

      const actual = series._calculateCenterXY(320);

      expect(actual.cx).toEqual(250);
      expect(actual.cy).toEqual(200);
    });
  });

  describe('_makeCircleBound()', () => {
    it('should make circle bounds of pie type chart like pie or donut chart.', () => {
      series.layout.dimension = {
        width: 400,
        height: 300
      };
      const actual = series._makeCircleBound();

      expect(actual).toEqual({
        cx: 200,
        cy: 150,
        r: 135
      });
    });
  });

  describe('_getArcPosition()', () => {
    it('should make arc position by using midpoint(cx, cy), radius, angle', () => {
      const actual = series._getArcPosition({
        cx: 100,
        cy: 100,
        r: 50,
        angle: 45
      });
      const expected = {
        left: 135.35533905932738,
        top: 64.64466094067262
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_addEndPosition()', () => {
    it('should add end position for rendering outer legend line.', () => {
      const positions = [
        {
          middle: {
            left: 100,
            top: 50
          }
        },
        {
          middle: {
            left: 150,
            top: 100
          }
        },
        {
          middle: {
            left: 100,
            top: 150
          }
        }
      ];

      series._addEndPosition(110, positions);

      expect(positions[0].middle.left).toBe(100);
      expect(positions[0].end.left).toBe(80);

      expect(positions[1].middle.left).toBe(150);
      expect(positions[1].end.left).toBe(170);

      expect(positions[2].middle.left).toBe(100);
      expect(positions[2].end.left).toBe(80);
    });
  });
  describe('_pickPositionsFromSectorData()', () => {
    it('Should return null even if the ratio value is zero.', () => {
      series.options = {
        showLabel: true,
        showLegend: true
      };
      series.seriesData = {
        sectorData: [
          {
            ratio: 0,
            centerPosition: { left: 463.44849855259173, top: 287.3915761608463 }
          },
          {
            ratio: 10,
            centerPosition: { left: 404.3042587679865, top: 501.44603132368695 }
          }
        ]
      };

      const result = series._pickPositionsFromSectorData('centerPosition', 'value');

      expect(result[0]).toBe(null);
    });
  });

  describe('_renderSeriesLabel()', () => {
    let seriesDataModel, paper;
    beforeEach(() => {
      const container = dom.create('div');
      seriesDataModel = new SeriesDataModel();
      paper = raphael(container, 100, 100);

      spyOn(series.graphRenderer, 'renderLabels');

      seriesDataModel.groups = [
        new SeriesGroup([
          {
            label: 10
          },
          {
            label: 20
          },
          {
            label: 30
          }
        ])
      ];
      series.legendLabels = ['apple', 'banana', 'graph'];
      series.valueLabels = ['10', '20', '30'];
    });

    it('labelPrefix option should be applied.', () => {
      series.options.showLabel = true;
      series.options.labelPrefix = '^';

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      series._renderSeriesLabel(paper, {});

      expect(series.graphRenderer.renderLabels.calls.allArgs()[0][0].labels[0]).toBe('^10');

      paper.remove();
    });

    it('labelSuffix option should be applied.', () => {
      series.options.showLabel = true;
      series.options.labelSuffix = '$';

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      series._renderSeriesLabel(paper, {});

      expect(series.graphRenderer.renderLabels.calls.allArgs()[0][0].labels[0]).toBe('10$');

      paper.remove();
    });

    it('showLabel and showLegend options are both true, they should all be displayed.', () => {
      series.options.showLabel = true;
      series.options.showLegend = true;

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      series._renderSeriesLabel(paper, {});

      expect(series.graphRenderer.renderLabels.calls.count()).toBe(2);
      expect(series.graphRenderer.renderLabels.calls.allArgs()[0][0].labels[0]).toBe('10');
      expect(series.graphRenderer.renderLabels.calls.allArgs()[1][0].labels[0]).toBe('apple');

      paper.remove();
    });

    it('showLabel option is true, only one should be displayed.', () => {
      series.options.showLabel = true;
      series.options.showLegend = false;

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      series._renderSeriesLabel(paper, {});

      const expectLabelObj = series.graphRenderer.renderLabels.calls.allArgs()[0][0].labels;

      expect(series.graphRenderer.renderLabels.calls.count()).toBe(1);
      expect(expectLabelObj[0]).toBe('10');

      paper.remove();
    });

    it('showRegend option is true, only one should be displayed.', () => {
      series.options.showLabel = false;
      series.options.showLegend = true;

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      series._renderSeriesLabel(paper, {});

      const expectLabelObj = series.graphRenderer.renderLabels.calls.allArgs()[0][0].labels;

      expect(series.graphRenderer.renderLabels.calls.count()).toBe(1);
      expect(expectLabelObj[0]).toBe('apple');

      paper.remove();
    });
  });
});
