/**
 * @fileoverview test zoom
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import Zoom from '../../../src/js/components/series/zoom';
import snippet from 'tui-code-snippet';

describe('Zoom', () => {
  let zoom;

  beforeEach(() => {
    zoom = new Zoom({
      eventBus: new snippet.CustomEvents(),
      dataProcessor: {
        options: {
          legend: {}
        }
      }
    });

    spyOn(zoom.eventBus, 'fire');
  });

  describe('_zoom()', () => {
    it('should send position to zoom event handler.', () => {
      const magn = 2;
      const position = {
        left: 10,
        top: 20
      };

      zoom.magn = 2;
      zoom._zoom(magn, position);

      expect(zoom.magn).toBe(2);
      expect(zoom.eventBus.fire).toHaveBeenCalledWith('zoomMap', 2, {
        left: 10,
        top: 20
      });
    });

    it('should not zoom-out at 1 magnification.', () => {
      const magn = 0.5;

      zoom.magn = 1;
      zoom._zoom(magn);

      expect(zoom.magn).toBe(1);
    });
  });

  describe('_calculateMagn()', () => {
    it('return "magn += 0.1" when wheel data is positive number', () => {
      zoom.magn = 1;

      expect(zoom._calculateMagn(1)).toBe(1.1);
    });
    it('return "magn -= 0.1" when wheel data is negetive number', () => {
      zoom.magn = 2;

      expect(zoom._calculateMagn(-1)).toBe(1.9);
    });
  });

  describe('onWheel()', () => {
    it('should zoom using wheelDelta value made with mouse wheel movement', () => {
      const expectedMagn = 1.1;

      zoom.magn = 1;
      zoom.onWheel(120);

      expect(zoom.magn).toBe(expectedMagn);
    });
  });
});
