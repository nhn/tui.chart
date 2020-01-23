/**
 * @fileoverview Test for MapChartEventDetector.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import MapChartEventDetector from '../../../src/js/components/mouseEventDetectors/mapChartEventDetector';
import dom from '../../../src/js/helpers/domHandler';

describe('Test for MapChartEventDetector', () => {
  let mouseEventDetector;

  beforeEach(() => {
    mouseEventDetector = new MapChartEventDetector({
      eventBus: new snippet.CustomEvents()
    });
    spyOn(mouseEventDetector.eventBus, 'fire');
    spyOn(mouseEventDetector, '_onMouseEvent');
  });

  describe('_onMouseDown()', () => {
    it('should trigger `dragStartMapSeries` custom event on mousedown event', () => {
      const eventObject = {
        clientX: 10,
        clientY: 20
      };
      const expectedEventName = 'dragStartMapSeries';
      const expectedPosition = {
        left: 10,
        top: 20
      };

      mouseEventDetector._onMousedown(eventObject);

      expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(
        expectedEventName,
        expectedPosition
      );
    });
  });

  describe('_onMouseup()', () => {
    it('should reset drag state and trigger `dragEndMapSeries` custom event, on mouse up while dragging', () => {
      const expectedEventName = 'dragEndMapSeries';

      mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
      mouseEventDetector.isDrag = true;
      mouseEventDetector._onMouseup();

      expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
      expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
    });

    it('should think mouse up without dragging to click event, then pass click object to series', () => {
      const eventObject = {
        clientX: 10,
        clientY: 20
      };
      const expectedStr = 'click';
      const expectedEventObject = eventObject;

      mouseEventDetector.isDrag = false;
      mouseEventDetector._onMouseup(eventObject);

      expect(mouseEventDetector._onMouseEvent).toHaveBeenCalledWith(
        expectedStr,
        expectedEventObject
      );
    });
  });

  describe('_onMousemove()', () => {
    it('should trigger `dragMapSeries` custom event, when after mousedown', () => {
      const eventObject = {
        clientX: 10,
        clientY: 20
      };
      const expectedEventName = 'dragMapSeries';
      const expectedPosition = {
        left: 10,
        top: 20
      };

      mouseEventDetector.isDown = true;
      mouseEventDetector.isDrag = true;
      mouseEventDetector._onMousemove(eventObject);

      expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(
        expectedEventName,
        expectedPosition
      );
    });

    it('should set state of mouse event detector to dragging, when mousedown and not yet dragging', () => {
      const eventObject = {
        clientX: 10,
        clientY: 20
      };

      mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV');
      mouseEventDetector.isDown = true;
      mouseEventDetector.isDrag = false;
      mouseEventDetector._onMousemove(eventObject);

      expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('drag');
    });

    it('should think no drag event trigger, if mouse moved without isDrag frag, and then pass event target coordinate', () => {
      const eventObject = {
        clientX: 10,
        clientY: 20
      };
      const expectedStr = 'move';
      const expectedEventObject = eventObject;

      mouseEventDetector.isDown = false;
      mouseEventDetector._onMousemove(eventObject);

      expect(mouseEventDetector._onMouseEvent).toHaveBeenCalledWith(
        expectedStr,
        expectedEventObject
      );
    });
  });

  describe('_onMouseup()', () => {
    it('should judge dragging is end and trigger `dragEndMapSeries` custom event, when mouse up after dragging', () => {
      const expectedEventName = 'dragEndMapSeries';

      mouseEventDetector.mouseEventDetectorContainer = dom.create('DIV', 'drag');
      mouseEventDetector.isDrag = true;
      mouseEventDetector._onMouseout();

      expect(mouseEventDetector.eventBus.fire).toHaveBeenCalledWith(expectedEventName);
      expect(mouseEventDetector.mouseEventDetectorContainer.className).toBe('');
    });
  });
});
