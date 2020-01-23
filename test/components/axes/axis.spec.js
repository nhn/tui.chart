/**
 * @fileoverview Test for Axis.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphael from 'raphael';
import axisFactory from '../../../src/js/components/axes/axis';
import dom from '../../../src/js/helpers/domHandler';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for Axis', () => {
  let dataProcessor, axis;

  beforeAll(() => {
    // Rendered width, height is different according to browser
    // Spy these functions so that make same test environment
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'isValidAllSeriesDataModel',
      'getCategories',
      'isCoordinateType',
      'getOption'
    ]);

    axis = new axisFactory.Axis({
      theme: {
        title: {
          fontSize: 12
        },
        label: {
          fontSize: 12
        },
        tickColor: 'black'
      },
      options: {
        title: {
          text: 'Axis Title'
        }
      },
      chartTheme: {
        chart: {
          background: '#fff',
          opacity: 1
        }
      },
      dataProcessor
    });
  });

  describe('_renderTitleArea()', () => {
    it('render title area', () => {
      const container = dom.create('div');
      const paper = raphael(container, 200, 200);

      axis.dimensionMap = {
        yAxis: {
          width: 80
        }
      };

      spyOn(axis.graphRenderer, 'renderTitle');

      axis._renderTitleArea(paper, 200);

      expect(axis.graphRenderer.renderTitle).toHaveBeenCalled();
    });

    it('do not render title area, when has no title', () => {
      const container = dom.create('div');
      const paper = raphael(container, 200, 200);
      spyOn(axis.graphRenderer, 'renderTitle');

      delete axis.options.title;
      axis._renderTitleArea(paper, 200);

      expect(axis.graphRenderer.renderTitle).not.toHaveBeenCalled();
    });
  });

  describe('_renderAxisArea()', () => {
    it('should increase width by yAxis, and make divided axis, when divided option is true', () => {
      const container = dom.create('DIV');

      spyOn(axis, '_renderNotDividedAxis');
      spyOn(axis, '_renderDividedAxis');

      axis.componentName = 'xAxis';
      axis.layout = {
        dimension: {
          width: 300,
          height: 50
        },
        position: {
          top: 20
        }
      };
      axis.dimensionMap = {
        yAxis: {
          width: 80
        }
      };
      axis.options.divided = true;
      axis.data = {
        labels: ['label1', 'label2', 'label3'],
        tickCount: 4
      };

      axis._renderAxisArea(container);

      expect(axis._renderNotDividedAxis).not.toHaveBeenCalled();
      expect(axis._renderDividedAxis).toHaveBeenCalled();
    });

    it('should call _renderNotDividedAxis(), when divided option is not true', () => {
      const container = dom.create('DIV');

      spyOn(axis, '_renderNotDividedAxis');
      spyOn(axis, '_renderDividedAxis');

      axis.componentName = 'xAxis';
      axis.layout = {
        dimension: {
          width: 300,
          height: 50
        },
        position: {
          top: 20
        }
      };
      axis.dimensionMap = {
        yAxis: {
          width: 80
        }
      };
      axis.data = {
        labels: ['label1', 'label2', 'label3'],
        tickCount: 4
      };

      axis._renderAxisArea(container);

      expect(axis._renderNotDividedAxis).toHaveBeenCalled();
      expect(axis._renderDividedAxis).not.toHaveBeenCalled();
    });

    it('bar chart with min minus should draw a standard line.', () => {
      const container = dom.create('DIV');

      spyOn(axis.graphRenderer, 'renderTitle');
      spyOn(axis.graphRenderer, 'renderTickLine');
      spyOn(axis, '_renderNegativeStandardsLine');

      axis.componentName = 'xAxis';
      axis.dataProcessor = {
        chartType: 'bar',
        getOption: () => {}
      };
      axis.layout = {
        dimension: {
          width: 300,
          height: 50
        },
        position: {
          top: 20
        }
      };
      axis.dimensionMap = {
        yAxis: {
          width: 80
        }
      };
      axis.data = {
        limit: 0,
        labels: [],
        tickCount: 0,
        options: {
          isCenter: false
        }
      };
      axis.limitMap = {
        bar: {
          min: -1000
        }
      };

      axis._renderAxisArea(container);

      expect(axis._renderNegativeStandardsLine).toHaveBeenCalled();
    });
  });

  describe('_renderNormalLabels()', () => {
    it('"_renderNormalLabels()" method, the labelMargin option must be reflected in the label position.', () => {
      spyOn(axis.graphRenderer, 'renderLabel');

      axis.layout = { position: { top: 20 } };
      axis.options = {
        labelMargin: 30
      };
      axis._renderNormalLabels([0], ['abc'], 0, 0);

      const labelPosition = axis.graphRenderer.renderLabel.calls.argsFor(0)[0].positionTopAndLeft;

      expect(labelPosition.top).toBe(67);
    });

    it('renderLabel should not occur when the tickInterval option is auto and the tick labels overlap.', () => {
      spyOn(axis.graphRenderer, 'renderLabel');
      spyOn(axis, '_isOverLapXAxisLabel').and.returnValue(true);

      axis.options = {
        labelMargin: 30,
        tickInterval: 'auto'
      };
      axis.isYAxis = false;
      axis._renderNormalLabels([0], ['abc'], 0, 0);

      expect(axis.graphRenderer.renderLabel).not.toHaveBeenCalled();
    });
  });

  describe('_renderRotationLabels()', () => {
    it('"_renderRotationLabels()" method, the labelMargin option must be reflected in the label position.', () => {
      spyOn(axis.graphRenderer, 'renderRotatedLabel');

      axis.layout = { position: { top: 20 } };
      axis.options = {
        labelMargin: 30
      };
      axis._renderRotationLabels([0], ['label1'], 0, 0);

      const labelPosition = axis.graphRenderer.renderRotatedLabel.calls.argsFor(0)[0]
        .positionTopAndLeft;

      expect(labelPosition.top).toBe(57);
    });
  });
});
