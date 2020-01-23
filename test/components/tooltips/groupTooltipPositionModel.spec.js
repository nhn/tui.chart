/**
 * @fileoverview Test for GroupTooltipPositionModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import GroupTooltipPositionModel from '../../../src/js/components/tooltips/groupTooltipPositionModel';
import chartConst from '../../../src/js/const';

describe('GroupTooltipPositionModel', () => {
  let positionModel;

  beforeEach(() => {
    positionModel = new GroupTooltipPositionModel(
      {},
      {
        dimension: {},
        position: {}
      },
      true,
      {}
    );
  });

  describe('_getHorizontalDirection()', () => {
    it('should return backward, if align option contains left.', () => {
      const actual = positionModel._getHorizontalDirection('left');
      const exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
      expect(actual).toBe(exptected);
    });

    it('should return center, if align option contains center.', () => {
      const actual = positionModel._getHorizontalDirection('center');
      const exptected = chartConst.TOOLTIP_DIRECTION_CENTER;
      expect(actual).toBe(exptected);
    });

    it('should return forward otherwise', () => {
      const actual = positionModel._getHorizontalDirection('right');
      const exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
      expect(actual).toBe(exptected);
    });
  });

  describe('_getVerticalDirection()', () => {
    it('should return backward, if align option contains top', () => {
      const actual = positionModel._getVerticalDirection('top');
      const exptected = chartConst.TOOLTIP_DIRECTION_BACKWARD;
      expect(actual).toBe(exptected);
    });

    it('should return forward, if align option contains bottom.', () => {
      const actual = positionModel._getVerticalDirection('bottom');
      const exptected = chartConst.TOOLTIP_DIRECTION_FORWARD;
      expect(actual).toBe(exptected);
    });

    it('should return center otherwise', () => {
      const actual = positionModel._getVerticalDirection('middle');
      const exptected = chartConst.TOOLTIP_DIRECTION_CENTER;
      expect(actual).toBe(exptected);
    });
  });

  describe('_setData()', () => {
    beforeEach(() => {
      spyOn(positionModel, '_makeVerticalData').and.returnValue('verticalData');
      spyOn(positionModel, '_makeHorizontalData').and.returnValue('horizontalData');
    });

    it('should set virticalData as main, and horizontalData as sub, if it is virtical chart.', () => {
      positionModel._setData({}, {}, true, {});
      expect(positionModel.mainData).toBe('verticalData');
      expect(positionModel.subData).toBe('horizontalData');
    });

    it('should set horizontalData as main, and verticalData as sub, if it is horizontal chart.', () => {
      positionModel._setData({}, {}, false, {});
      expect(positionModel.mainData).toBe('horizontalData');
      expect(positionModel.subData).toBe('verticalData');
    });

    it('should set position to zero, if options.position is not exist', () => {
      positionModel._setData({}, {}, false, {});
      expect(positionModel.positionOption.left).toBe(0);
      expect(positionModel.positionOption.top).toBe(0);
    });

    it('should upate position if options.offset exists', () => {
      positionModel._setData({}, {}, false, {
        offset: {
          x: 10,
          y: 20
        }
      });
      expect(positionModel.positionOption.left).toBe(10);
      expect(positionModel.positionOption.top).toBe(20);
    });
  });

  describe('_calculateMainPositionValue()', () => {
    it('should calculate position to have right spaces of 5, if forward direction.', () => {
      const tooltipSize = 50;
      const range = {
        start: 0,
        end: 50
      };
      const data = {
        basePosition: 0,
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD
      };
      const actual = positionModel._calculateMainPositionValue(tooltipSize, range, data);
      const expected = 55;
      expect(actual).toBe(expected);
    });

    it('should calculate position to have left spaces of 5, if backword direction.', () => {
      const tooltipSize = 50;
      const range = {
        start: 100,
        end: 150
      };
      const data = {
        basePosition: 0,
        direction: chartConst.TOOLTIP_DIRECTION_BACKWARD
      };
      const actual = positionModel._calculateMainPositionValue(tooltipSize, range, data);
      const expected = 45;
      expect(actual).toBe(expected);
    });

    it('should calculate position to range.start, if center direction && line(rnage.start === range.end).', () => {
      const tooltipSize = 50;
      const range = {
        start: 100,
        end: 100
      };
      const data = {
        basePosition: 0,
        direction: chartConst.TOOLTIP_DIRECTION_CENTER
      };
      const actual = positionModel._calculateMainPositionValue(tooltipSize, range, data);
      const expected = 75;
      expect(actual).toBe(expected);
    });

    it('should calculate position to (range.start + range.end) /2, if center direction && !line(range.start !== range.end)', () => {
      const tooltipSize = 50;
      const range = {
        start: 100,
        end: 150
      };
      const data = {
        basePosition: 0,
        direction: chartConst.TOOLTIP_DIRECTION_CENTER
      };
      const actual = positionModel._calculateMainPositionValue(tooltipSize, range, data);
      const expected = 100;
      expect(actual).toBe(expected);
    });
  });

  describe('_calculateSubPositionValue()', () => {
    it('should position tooltip positions at the center. if it is forward direction.', () => {
      const tooltipSize = 50;
      const data = {
        basePosition: 0,
        areaSize: 100,
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD
      };
      const actual = positionModel._calculateSubPositionValue(tooltipSize, data);
      const expected = 50;
      expect(actual).toBe(expected);
    });

    it('should position tooltip bottom at the middle of tooltip area, if backward direction.', () => {
      const tooltipSize = 50;
      const data = {
        basePosition: 0,
        areaSize: 100,
        direction: chartConst.TOOLTIP_DIRECTION_BACKWARD
      };
      const actual = positionModel._calculateSubPositionValue(tooltipSize, data);
      const expected = 0;
      expect(actual).toBe(expected);
    });

    it('should position tooltip at the middle of tooltip area, if center direction.', () => {
      const tooltipSize = 50;
      const data = {
        basePosition: 0,
        areaSize: 100,
        direction: chartConst.TOOLTIP_DIRECTION_CENTER
      };
      const actual = positionModel._calculateSubPositionValue(tooltipSize, data);
      const expected = 25;
      expect(actual).toBe(expected);
    });
  });

  describe('_adjustBackwardPositionValue()', () => {
    it('should not adjust position, if position value is not beyond chart backward position.', () => {
      const value = -10;
      const range = {};
      const tooltipSize = 50;
      const data = {
        areaPosition: 20
      };
      const actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data);
      const expected = -10;
      expect(actual).toBe(expected);
    });

    it('should flip position, if position value is beyond chart backward.', () => {
      const value = -30;
      const range = {
        start: 25,
        end: 50
      };
      const tooltipSize = 50;
      const data = {
        basePosition: 0,
        areaPosition: 20
      };
      const actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data);
      const expected = 55;
      expect(actual).toBe(expected);
    });

    it('should re-correct chart position, if position is beyond chart area after flip', () => {
      const value = -30;
      const range = {
        start: 5,
        end: 30
      };
      const tooltipSize = 50;
      const data = {
        basePosition: 0,
        areaPosition: 20
      };
      const actual = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data);
      const expected = 35;
      expect(actual).toBe(expected);
    });
  });

  describe('_adjustForwardPositionValue()', () => {
    it('should not adjust position, if position is not beyond chart forward area.', () => {
      const value = 50;
      const range = {
        start: 50,
        end: 100
      };
      const tooltipSize = 50;
      const data = {
        chartSize: 150,
        areaPosition: 20,
        basePosition: 0
      };
      const actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data);
      const expected = 50;
      expect(actual).toBe(expected);
    });

    it('should flip position, if position is beyond chart forward area.', () => {
      const value = 50;
      const range = {
        start: 50,
        end: 100
      };
      const tooltipSize = 50;
      const data = {
        chartSize: 110,
        areaPosition: 20,
        basePosition: 0
      };
      const actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data);
      const expected = -5;
      expect(actual).toBe(expected);
    });

    it('should re-correct position, if position is beyond chart area after flipping.', () => {
      const value = 50;
      const range = {
        start: 50,
        end: 100
      };
      const tooltipSize = 70;
      const data = {
        chartSize: 90,
        areaPosition: 20,
        basePosition: 0
      };
      const actual = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data);
      const expected = 0;
      expect(actual).toBe(expected);
    });
  });

  describe('_adjustMainPositionValue()', () => {
    it('should call _adjustBackwardPositionValue() if backward direction.', () => {
      const value = -10;
      const range = {};
      const tooltipSize = 50;
      const data = {
        direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
        areaPosition: 20
      };
      const actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data);
      const expected = positionModel._adjustBackwardPositionValue(value, range, tooltipSize, data);
      expect(actual).toBe(expected);
    });

    it('should call _adjustForwardPositionValue() if forward direction.', () => {
      const value = 50;
      const range = {
        start: 50,
        end: 100
      };
      const tooltipSize = 50;
      const data = {
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
        chartSize: 150,
        areaPosition: 20,
        basePosition: 0
      };
      const actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data);
      const expected = positionModel._adjustForwardPositionValue(value, range, tooltipSize, data);
      expect(actual).toBe(expected);
    });

    it('should correct tooltip position of center direction, only if tooltip is beyond chart area.', () => {
      const value = 50;
      const range = {
        start: 50,
        end: 100
      };
      const tooltipSize = 50;
      const data = {
        direction: chartConst.TOOLTIP_DIRECTION_CENTER,
        chartSize: 110,
        areaPosition: 20,
        basePosition: 0
      };
      const actual = positionModel._adjustMainPositionValue(value, range, tooltipSize, data);
      const expected = 40;
      expect(actual).toBe(expected);
    });
  });

  describe('_adjustSubPositionValue()', () => {
    it('should adjust tooltip position of forward direction, to make tooltip is not beyond chart forward area.', () => {
      const value = 50;
      const tooltipSize = 50;
      const data = {
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
        chartSize: 100,
        areaPosition: 10
      };
      const actual = positionModel._adjustSubPositionValue(value, tooltipSize, data);
      const expected = 40;
      expect(actual).toBe(expected);
    });

    it('should adjust tooltip position of backward directoin, to make tooltip is not beyond chart backward area.', () => {
      const value = -20;
      const tooltipSize = 50;
      const data = {
        direction: chartConst.TOOLTIP_DIRECTION_BACKWARD,
        chartSize: 100,
        areaPosition: 10
      };
      const actual = positionModel._adjustSubPositionValue(value, tooltipSize, data);
      const expected = -10;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeMainPositionValue()', () => {
    it('should calculate main position.', () => {
      const tooltipDimension = {
        width: 50
      };
      const range = {
        start: 50,
        end: 100
      };
      const data = {
        basePosition: 0,
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
        sizeType: 'width',
        positionType: 'left'
      };

      positionModel.positionOption = {
        left: 10
      };

      const actual = positionModel._makeMainPositionValue(tooltipDimension, range, data);
      const expected = 115;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeSubPositionValue()', () => {
    it('should calculate sub position.', () => {
      const tooltipDimension = {
        width: 50
      };
      const data = {
        basePosition: 0,
        areaPosition: 0,
        areaSize: 100,
        chartSize: 100,
        direction: chartConst.TOOLTIP_DIRECTION_FORWARD,
        sizeType: 'width',
        positionType: 'left'
      };

      positionModel.positionOption = {
        left: 10
      };

      const actual = positionModel._makeSubPositionValue(tooltipDimension, data);
      const expected = 50;
      expect(actual).toBe(expected);
    });
  });

  describe('_calculatePosition()', () => {
    it('should calculate group tooltip position.', () => {
      positionModel.mainData = {
        positionType: 'left'
      };
      positionModel.subData = {
        positionType: 'top'
      };
      spyOn(positionModel, '_makeMainPositionValue').and.returnValue(10);
      spyOn(positionModel, '_makeSubPositionValue').and.returnValue(20);
      const actual = positionModel.calculatePosition(
        {},
        {
          start: 10,
          end: 100
        }
      );

      expect(actual.left).toBe(10);
      expect(actual.top).toBe(20);
      expect(actual).toBe(positionModel.positions['10-100']);
    });
  });
});
