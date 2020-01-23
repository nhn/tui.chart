/**
 * @fileoverview Test for zoomMixer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import zoomMixer from '../../../src/js/components/mouseEventDetectors/zoomMixer';
import MouseEventDetectorBase from '../../../src/js/components/mouseEventDetectors/mouseEventDetectorBase';
import dom from '../../../src/js/helpers/domHandler';

describe('Test for zoomMixer', () => {
  beforeAll(() => {
    zoomMixer._getContainerBound = jasmine.createSpy('_getContainerBound');
    zoomMixer._calculateLayerPosition = MouseEventDetectorBase.prototype._calculateLayerPosition;
  });

  beforeEach(() => {
    zoomMixer.expandSize = 0;
    zoomMixer.layout = {
      position: {
        top: 0,
        left: 0
      }
    };
    zoomMixer.positionMap = {
      series: {
        left: 50,
        top: 50
      }
    };
  });

  describe('_showDragSelection()', () => {
    beforeEach(() => {
      zoomMixer.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', [
        'getBoundingClientRect'
      ]);
    });

    it('should set left and width using clinetX, layerX', () => {
      zoomMixer.dragSelectionElement = dom.create('DIV');
      zoomMixer.startLayerX = 100;
      zoomMixer.startClientPosition = { x: 150 };
      zoomMixer.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 150
      });

      zoomMixer._showDragSelection(50);

      expect(zoomMixer.dragSelectionElement.style.left).toBe('40px');
      expect(zoomMixer.dragSelectionElement.style.width).toBe('60px');
    });

    it('should set left to startLayerX, if layerX is greater than startLayerX.', () => {
      zoomMixer.dragSelectionElement = dom.create('DIV');
      zoomMixer.startLayerX = 30;
      zoomMixer.startClientPosition = { x: 80 };
      zoomMixer.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 150
      });

      zoomMixer._showDragSelection(130);

      expect(zoomMixer.dragSelectionElement.style.left).toBe('30px');
      expect(zoomMixer.dragSelectionElement.style.width).toBe('90px');
    });

    it('should append `show` class name to dragSelectionElement when calling _showLayerSelection().', () => {
      zoomMixer.dragSelectionElement = dom.create('DIV');
      zoomMixer.startLayerX = 30;
      zoomMixer.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 50,
        right: 150
      });

      zoomMixer._showDragSelection(130);

      expect(zoomMixer.dragSelectionElement.className).toBe('show');
    });
  });

  describe('_adjustIndexRange()', () => {
    it('should make ranges of index from startIndex and endIndex.', () => {
      const actual = zoomMixer._adjustIndexRange(2, 5);

      expect(actual).toEqual({ startIndex: 2, endIndex: 5 });
    });

    it('should switch order of startIndex and endIndex, if startIndex is less than endIndex.', () => {
      const actual = zoomMixer._adjustIndexRange(8, 5);

      expect(actual).toEqual({ startIndex: 5, endIndex: 8 });
    });

    it('should change endIndex to 2, if startIndex and endIndex are 0', () => {
      const actual = zoomMixer._adjustIndexRange(0, 0);

      expect(actual).toEqual({ startIndex: 0, endIndex: 2 });
    });

    it('should make ranges to [startIndex - 1, endIndex + 1], if startIndex and endIndex are not 0.', () => {
      const actual = zoomMixer._adjustIndexRange(2, 2);

      expect(actual).toEqual({ startIndex: 1, endIndex: 3 });
    });

    it('should set ranges [startIndex, endIndex + 1], if startIndex is 0 and endIndex is 1.', () => {
      const actual = zoomMixer._adjustIndexRange(0, 1);

      expect(actual).toEqual({ startIndex: 0, endIndex: 2 });
    });

    it('should set reanges [startIndex -1, endIndex], when (startIndex === endIndex - 1 && startIndex !== 0)', () => {
      const actual = zoomMixer._adjustIndexRange(5, 6);

      expect(actual).toEqual({ startIndex: 4, endIndex: 6 });
    });

    it('should return as it is, if (startIndex - endIndex) > 1.', () => {
      const actual = zoomMixer._adjustIndexRange(5, 10);

      expect(actual).toEqual({ startIndex: 5, endIndex: 10 });
    });

    it('should switch startIndex and endIndex, if (endIndex - startIndex) > 1.', () => {
      const actual = zoomMixer._adjustIndexRange(15, 10);

      expect(actual).toEqual({ startIndex: 10, endIndex: 15 });
    });
  });
});
