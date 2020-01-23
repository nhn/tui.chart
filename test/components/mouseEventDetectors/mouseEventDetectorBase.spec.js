/**
 * @fileoverview Test for MouseEventDetectorBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import MouseEventDetectorBase from '../../../src/js/components/mouseEventDetectors/mouseEventDetectorBase';
import chartConst from '../../../src/js/const';

describe('Test for MouseEventDetectorBase', () => {
  let mouseEventDetectorBase;

  beforeEach(() => {
    mouseEventDetectorBase = new MouseEventDetectorBase({
      eventBus: new snippet.CustomEvents()
    });
    mouseEventDetectorBase.positionMap = {
      series: {
        left: 50,
        top: 50
      }
    };
  });

  describe('_isChangedSelectData()', () => {
    it('should return true, when found no data', () => {
      const actual = mouseEventDetectorBase._isChangedSelectData(
        {
          chartType: 'column'
        },
        null
      );
      const expected = true;
      expect(actual).toBe(expected);
    });

    it('should return true, if there is no previous data', () => {
      const actual = mouseEventDetectorBase._isChangedSelectData(null, {
        chartType: 'line'
      });
      const expected = true;
      expect(actual).toBe(expected);
    });

    it('should return true, if found data is not same to previous one', () => {
      const actual = mouseEventDetectorBase._isChangedSelectData(
        {
          chartType: 'column'
        },
        {
          chartType: 'line'
        }
      );
      const expected = true;
      expect(actual).toBe(expected);
    });

    it("should return true, if found data's groupIndex is not same to previous one", () => {
      const actual = mouseEventDetectorBase._isChangedSelectData(
        {
          indexes: {
            groupIndex: 0
          }
        },
        {
          indexes: {
            groupIndex: 1
          }
        }
      );
      const expected = true;
      expect(actual).toBe(expected);
    });

    it("should return true, if found data's index is not same to previous one", () => {
      const actual = mouseEventDetectorBase._isChangedSelectData(
        {
          indexes: {
            index: 0
          }
        },
        {
          indexes: {
            index: 1
          }
        }
      );
      const expected = true;
      expect(actual).toBe(expected);
    });
  });

  describe('_calculateLayerPosition()', () => {
    beforeEach(() => {
      mouseEventDetectorBase.mouseEventDetectorContainer = jasmine.createSpyObj(
        'mouseEventDetectorContainer',
        ['getBoundingClientRect']
      );
    });

    it('should calulate layerX by subtract SERIES_EXPAND_SIZE and rect.left from clientX', () => {
      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450
      });

      const actual = mouseEventDetectorBase._calculateLayerPosition(150);

      expect(actual.x).toBe(140);
    });

    it('should adjust limit, if clientX is less than container.left', () => {
      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450
      });
      mouseEventDetectorBase.expandSize = chartConst.SERIES_EXPAND_SIZE;

      const actual = mouseEventDetectorBase._calculateLayerPosition(30);

      expect(actual.x).toBe(50);
    });

    it('should not adjust limit value, when checkLimit is false', () => {
      const clientX = 30;
      const checkLimit = false;
      let clientY;

      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450
      });

      const actual = mouseEventDetectorBase._calculateLayerPosition(clientX, clientY, checkLimit);

      expect(actual.x).toBe(20);
    });

    it('should adjust position, if clientX is less than event detector left', () => {
      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450
      });
      mouseEventDetectorBase.expandSize = chartConst.SERIES_EXPAND_SIZE;

      const actual = mouseEventDetectorBase._calculateLayerPosition(480);

      expect(actual.x).toBe(430);
    });

    it('should not adjust position, if checkLimit is false even though clientX is less than event detector left.', () => {
      const clientX = 480;
      const checkLimit = false;
      let clientY;

      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450
      });

      const actual = mouseEventDetectorBase._calculateLayerPosition(clientX, clientY, checkLimit);

      expect(actual.x).toBe(470);
    });

    it('should return y when clientY is exist.', () => {
      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450,
        top: 50
      });

      const actual = mouseEventDetectorBase._calculateLayerPosition(150, 150);

      expect(actual.y).toBe(140);
    });

    it('should not return y when no clientY.', () => {
      mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 450,
        top: 50
      });

      const actual = mouseEventDetectorBase._calculateLayerPosition(150);

      expect(actual.y).toBeUndefined();
    });
  });
});
