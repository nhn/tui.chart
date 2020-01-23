/**
 * @fileoverview Test for renderingLabelHelper.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import labelHelper from '../../../src/js/components/series/renderingLabelHelper';
import renderUtil from '../../../src/js/helpers/renderUtil';
import snippet from 'tui-code-snippet';

describe('Test for renderingLabelHelper', () => {
  beforeAll(() => {
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  describe('_calculateLeftPositionForCenterAlign()', () => {
    it('should calculate left position for center alignment.', () => {
      const bound = {
        left: 50,
        width: 40
      };
      const actual = labelHelper._calculateLeftPositionForCenterAlign(bound, 60);

      expect(actual).toBe(70);
    });
  });

  describe('_calculateTopPositionForMiddleAlign()', () => {
    it('should calculate top position for middle alignment.', () => {
      const bound = {
        top: 50,
        height: 40
      };
      const actual = labelHelper._calculateTopPositionForMiddleAlign(bound, 60);

      expect(actual).toBe(70);
    });
  });

  describe('_makePositionForBoundType()', () => {
    it('should calculate position of bound type chart.', () => {
      const bound = {
        left: 30,
        top: 20,
        width: 40,
        height: 50
      };
      const actual = labelHelper._makePositionForBoundType(bound, 20, 'label');

      expect(actual.left).toBe(50);
      expect(actual.top).toBe(45);
    });
  });

  describe('_makePositionMap()', () => {
    it('should make position map having only an end property, if it is not range value.', () => {
      const seriesItem = {
        value: 10
      };
      const bound = {
        left: 30,
        top: 20,
        width: 40,
        height: 50
      };
      const makePosition = snippet.bind(labelHelper._makePositionForBoundType, labelHelper);
      const actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

      expect(actual.end).toEqual({
        left: 50,
        top: 45
      });
      expect(actual.start).toBeUndefined();
    });

    it('should make position map having start, end property, if it is range value.', () => {
      const seriesItem = {
        value: 10,
        isRange: true
      };
      const bound = {
        left: 30,
        top: 20,
        width: 40,
        height: 50
      };
      const makePosition = snippet.bind(labelHelper._makePositionForBarChart, labelHelper);
      const actual = labelHelper._makePositionMap(seriesItem, bound, 20, {}, makePosition);

      expect(actual.end).toEqual({
        left: 75,
        top: 45
      });
      expect(actual.start).toEqual({
        left: -25,
        top: 45
      });
    });
  });
});
