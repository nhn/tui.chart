/**
 * @fileoverview Test for singleTooltipMixer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import singleTooltipMixer from '../../../src/js/components/tooltips/singleTooltipMixer';
import chartConst from '../../../src/js/const';
import dom from '../../../src/js/helpers/domHandler';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('singleTooltip', () => {
  let tooltip, dataProcessor;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getCategories',
      'getFormattedGroupValues',
      'getLegendLabels',
      'getValue'
    ]);
    dataProcessor.getCategories.and.returnValue(['Silver', 'Gold']);
    dataProcessor.getFormattedGroupValues.and.returnValue([['10', '20']]);
    dataProcessor.getLegendLabels.and.returnValue(['Density1', 'Density2']);

    tooltip = singleTooltipMixer;
    tooltip.dataProcessor = dataProcessor;
    tooltip.layout = {
      position: {
        top: 0,
        left: 0
      }
    };
  });

  describe('_setIndexesCustomAttribute()', () => {
    it('should set the index information in the tooltip element as a custom attribute.', () => {
      const elTooltip = dom.create('DIV');
      tooltip._setIndexesCustomAttribute(elTooltip, {
        groupIndex: 0,
        index: 1
      });
      expect(parseInt(elTooltip.getAttribute('data-groupIndex'), 10)).toBe(0);
      expect(parseInt(elTooltip.getAttribute('data-index'), 10)).toBe(1);
    });
  });

  describe('_getIndexesCustomAttribute()', () => {
    it('should return tooltip indexes from custom attributes in tooltip element.', () => {
      const elTooltip = dom.create('DIV');
      elTooltip.setAttribute('data-groupIndex', 0);
      elTooltip.setAttribute('data-index', 1);
      const actual = tooltip._getIndexesCustomAttribute(elTooltip);

      expect(actual.groupIndex).toBe(0);
      expect(actual.index).toBe(1);
    });
  });

  describe('_setShowedCustomAttribute()', () => {
    it('should set showed custom attribute to tooltip element.', () => {
      const elTooltip = dom.create('DIV');
      tooltip._setShowedCustomAttribute(elTooltip, true);
      const isShowed =
        elTooltip.getAttribute('data-showed') === 'true' ||
        elTooltip.getAttribute('data-showed') === true;
      expect(isShowed).toBe(true);
    });
  });

  describe('_isShowedTooltip()', () => {
    it("should show tooltip if tooltip's showed custom attribute is true", () => {
      const elTooltip = dom.create('DIV');
      elTooltip.setAttribute('data-showed', true);
      const actual = tooltip._isShowedTooltip(elTooltip);
      expect(actual).toBe(true);
    });
  });

  describe('_makeLeftPositionOfNotBarChart()', () => {
    it('should calculate left position, if it is not bar type chart and has "left" align option.', () => {
      const actual = tooltip._makeLeftPositionOfNotBarChart(50, 'left', -30, 5);
      const expected = 75;
      expect(actual).toBe(expected);
    });

    it('should calculate left position, if it is not bar type chart and has "center" align option.', () => {
      const actual = tooltip._makeLeftPositionOfNotBarChart(50, 'center', -30);
      const expected = 65;
      expect(actual).toBe(expected);
    });

    it('should calculate left position, if it is not bar type chart and has "right" align option.', () => {
      const actual = tooltip._makeLeftPositionOfNotBarChart(50, 'right', -30, 5);
      const expected = 55;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeTopPositionOfNotBarChart()', () => {
    it('should calculate top position, if it is not bar type chart and has "bottom" align option.', () => {
      const actual = tooltip._makeTopPositionOfNotBarChart(50, 'bottom', 30, 5);
      const expected = 85;
      expect(actual).toBe(expected);
    });

    it('should calculate top position, if it is not bar type chart and has "middle" align option.', () => {
      const actual = tooltip._makeTopPositionOfNotBarChart(50, 'middle', 30);
      const expected = 65;
      expect(actual).toBe(expected);
    });

    it('should calculate top position, if it is not bar type chart and has "top" align option.', () => {
      const actual = tooltip._makeTopPositionOfNotBarChart(50, 'top');
      const expected = 45;
      expect(actual).toBe(expected);
    });
  });

  describe('makeTooltipPositionForNotBarChart()', () => {
    it('should calculate position of non bar type chart using tooltip position.', () => {
      const actual = tooltip._makeTooltipPositionForNotBarChart({
        bound: {
          width: 25,
          height: 50,
          top: 50,
          left: 10
        },
        dimension: {
          width: 50,
          height: 30
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });
      const expected = {
        left: 15,
        top: 10
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeTooltipPositionToMousePosition()', () => {
    it('should calculate tooltip position of pie chart using mouse position.', () => {
      tooltip.seriesPosition = {
        left: 10,
        top: 0
      };

      tooltip.containerBound = { left: 10, top: 0 };
      const actual = tooltip._makeTooltipPositionToMousePosition({
        mousePosition: {
          left: 50,
          top: 50
        },
        dimension: {
          width: 50,
          height: 30
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });
      const expected = {
        left: 55,
        top: 10
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeLeftPositionForBarChart()', () => {
    it('should calculate left position, if it is bar chart and has "left" align option', () => {
      const actual = tooltip._makeLeftPositionForBarChart(50, 'left', 30);
      const expected = 20;
      expect(actual).toBe(expected);
    });

    it('should calculate left position, if it is bar chart and has "center" align option', () => {
      const actual = tooltip._makeLeftPositionForBarChart(50, 'center', 30);
      const expected = 35;
      expect(actual).toBe(expected);
    });

    it('should calculate left position, if it is bar chart and has "right" align option', () => {
      const actual = tooltip._makeLeftPositionForBarChart(50, 'right', 30);
      const expected = 55;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeTopPositionForBarChart()', () => {
    it('should calculate top position, if it is bar chart and aligned "top".', () => {
      const actual = tooltip._makeTopPositionForBarChart(50, 'top', -30);
      const expected = 80;
      expect(actual).toBe(expected);
    });

    it('should calculate top position, if it is bar chart and aligned "middle".', () => {
      const actual = tooltip._makeTopPositionForBarChart(50, 'middle', -30);
      const expected = 65;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeTooltipPositionForBarChart()', () => {
    it('should caluclate position of bar chart using tooltip position.', () => {
      const acutal = tooltip._makeTooltipPositionForBarChart({
        bound: {
          width: 50,
          height: 25,
          top: 10,
          left: 0
        },
        id: 'id-0-0',
        dimension: {
          width: 50,
          height: 30
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });
      const expected = {
        left: 55,
        top: 10
      };

      expect(acutal).toEqual(expected);
    });
  });

  describe('_makeTooltipPositionForTreemapChart()', () => {
    it('make tooltip position for treemap chart', () => {
      spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

      const actual = tooltip._makeTooltipPositionForTreemapChart({
        bound: {
          width: 80,
          height: 60,
          top: 40,
          left: 50
        },
        id: 'id-0-0',
        dimension: {
          width: 50,
          height: 40
        },
        positionOption: {
          left: 0,
          top: 0
        }
      });

      expect(actual).toEqual({
        left: 65,
        top: 50
      });
    });

    it('make tooltip position for treemap chart, when position option', () => {
      spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

      const actual = tooltip._makeTooltipPositionForTreemapChart({
        bound: {
          width: 80,
          height: 60,
          top: 40,
          left: 50
        },
        id: 'id-0-0',
        dimension: {
          width: 50,
          height: 40
        },
        positionOption: {
          left: 20,
          top: -20
        }
      });

      expect(actual).toEqual({
        left: 85,
        top: 30
      });
    });
  });

  describe('_moveToSymmetry()', () => {
    it('should flip position based on origin(0,0), if value of specfic id is negative value(minus).', () => {
      dataProcessor.getValue.and.returnValue(-3);

      tooltip.chartType = 'bar';

      const actual = tooltip._moveToSymmetry(
        {
          left: 120
        },
        {
          bound: {
            left: 60,
            width: 60
          },
          sizeType: 'width',
          positionType: 'left',
          indexes: {
            groupIndex: 0,
            index: 2
          },
          dimension: {
            width: 50
          },
          addPadding: 0,
          chartType: 'column'
        }
      );

      expect(actual).toEqual({
        left: 10
      });
    });
  });

  describe('_adjustPosition()', () => {
    beforeAll(() => {
      tooltip.dimensionMap = {
        chart: {
          width: 200,
          height: 100
        }
      };
      tooltip.layout = {
        position: {
          left: 10,
          top: 10
        }
      };
    });

    it('should correct left position of tooltip, if left part of tooltip is invisible due to tooltip.left is beyond chart.left.', () => {
      const tooltipDimension = {
        width: 50,
        height: 50
      };
      const position = {
        left: -20,
        top: 10
      };

      const actual = tooltip._adjustPosition(tooltipDimension, position);
      const expected = -10;

      expect(actual.left).toBe(expected);
    });

    it('should correct left position of tooltip, if right of tooltip is invisible due to tooltip.right is beyond chart.right.', () => {
      const tooltipDimension = {
        width: 50,
        height: 50
      };
      const position = {
        left: 180,
        top: 10
      };

      const actual = tooltip._adjustPosition(tooltipDimension, position);
      const expected = 140;
      expect(actual.left).toBe(expected);
    });

    it('should correct top position of tooltip, if top of tooltip is invisible due to tooltip.top is beyond chart.top.', () => {
      const tooltipDimension = {
        width: 50,
        height: 50
      };
      const position = {
        left: 10,
        top: -20
      };
      const actual = tooltip._adjustPosition(tooltipDimension, position);
      const expected = -10;
      expect(actual.top).toBe(expected);
    });

    it('should correct left position of tooltip, if bottom of tooltip is invisible due to tooltip.bottom is beyond chart.bottom.', () => {
      const tooltipDimension = {
        width: 50,
        height: 50
      };
      const position = {
        left: 10,
        top: 80
      };
      const actual = tooltip._adjustPosition(tooltipDimension, position);
      const expected = 40;
      expect(actual.top).toBe(expected);
    });
  });

  describe('_makeTooltipPosition()', () => {
    it('should calculate tooltip position using virtical chart dimension.', () => {
      tooltip.bound = {};
      spyOn(tooltip, '_adjustPosition').and.callFake((tooltimDimension, position) => position);
      const actual = tooltip._makeTooltipPosition({
        bound: {
          width: 25,
          height: 50,
          top: 50,
          left: 10
        },
        dimension: {
          width: 50,
          height: 30
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });
      const expected = {
        left: 5,
        top: 0
      };

      expect(actual).toEqual(expected);
    });

    it('should calculate tootlip position using horizontal chart dimension.', () => {
      tooltip.bound = {};
      spyOn(tooltip, '_adjustPosition').and.callFake((tooltimDimension, position) => position);
      const actual = tooltip._makeTooltipPosition({
        bound: {
          width: 50,
          height: 25,
          top: 10,
          left: 0
        },
        chartType: chartConst.CHART_TYPE_BAR,
        dimension: {
          width: 50,
          height: 30
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });
      const expected = {
        left: 45,
        top: 0
      };
      expect(actual).toEqual(expected);
    });

    it('make tooltip position for treemap chart', () => {
      tooltip.bound = {};
      spyOn(tooltip, '_adjustPosition').and.callFake((tooltimDimension, position) => position);
      spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

      const actual = tooltip._makeTooltipPosition({
        bound: {
          width: 50,
          height: 25,
          top: 50,
          left: 0
        },
        chartType: chartConst.CHART_TYPE_TREEMAP,
        id: 'id-0-0',
        dimension: {
          width: 50,
          height: 40
        },
        alignOption: '',
        positionOption: {
          left: 0,
          top: 0
        }
      });

      expect(actual).toEqual({
        left: -10,
        top: 32.5
      });
    });
  });
});
