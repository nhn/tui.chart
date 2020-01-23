/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import RaphaelLineTypeBase from '../../src/js/plugins/raphaelLineTypeBase';
import raphael from 'raphael';

describe('RaphaelLineTypeBase', () => {
  let lineTypeBase;

  beforeEach(() => {
    lineTypeBase = new RaphaelLineTypeBase();
  });

  describe('_makeLinesPath()', () => {
    it('should create path usgin top, left data', () => {
      const actual = lineTypeBase._makeLinesPath([
        {
          left: 10,
          top: 10
        },
        {
          left: 100,
          top: 100
        }
      ]);
      const expected = ['M', 10, 10, 'L', 100, 100];

      expect(actual).toEqual(expected);
    });

    it('should create path using position.startTop, if posTopType is startTop', () => {
      const actual = lineTypeBase._makeLinesPath(
        [
          {
            left: 10,
            top: 10,
            startTop: 0
          },
          {
            left: 100,
            top: 100,
            startTop: 50
          }
        ],
        'startTop'
      );
      const expected = ['M', 10, 0, 'L', 100, 50];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeSplineLinesPath()', () => {
    it('should create spline path using top, left data', () => {
      const actual = lineTypeBase._makeSplineLinesPath([
        {
          left: 10,
          top: 10
        },
        {
          left: 100,
          top: 100
        }
      ]);
      const expected = [
        ['M', 10, 10, 'C', 10, 10],
        [100, 100, 100, 100]
      ];

      expect(actual).toEqual(expected);
    });

    it('should be cut off left anchor that overflow chart canvas', () => {
      const actual = lineTypeBase._makeSplineLinesPath([
        {
          left: 87,
          top: 318,
          startTop: 346
        },
        {
          left: 334.5,
          top: 44,
          startTop: 346
        },
        {
          left: 582,
          top: 54,
          startTop: 346
        }
      ]);
      const expected = [
        ['M', 87, 318, 'C', 87, 318],
        [220.41745061183047, 91.95033289869701, 334.5, 44, 448.5825493881695, 44],
        [582, 54, 582, 54]
      ];

      expect(actual).toEqual(expected);
    });

    it('should be cut off right anchor that overflow chart canvas', () => {
      const actual = lineTypeBase._makeSplineLinesPath([
        {
          left: 87,
          top: 346,
          startTop: 346
        },
        {
          left: 334.5,
          top: 344.48,
          startTop: 346
        },
        {
          left: 582,
          top: 42,
          startTop: 346
        }
      ]);
      const expected = [
        ['M', 87, 346, 'C', 87, 346],
        [222.8332650202649, 344.48, 334.5, 344.48, 446.1667349797351, 291.14518211369244],
        [582, 42, 582, 42]
      ];

      expect(actual).toEqual(expected);
    });

    it('"M" command should be removed if it is not the first line to start.', () => {
      const actual = lineTypeBase._makeSplineLinesPath(
        [
          {
            left: 87,
            top: 346,
            startTop: 346
          },
          {
            left: 334.5,
            top: 344.48,
            startTop: 346
          },
          {
            left: 582,
            top: 42,
            startTop: 346
          }
        ],
        {
          isBeConnected: true
        }
      );
      const expected = [
        ['C', 87, 346],
        [222.8332650202649, 344.48, 334.5, 344.48, 446.1667349797351, 291.14518211369244],
        [582, 42, 582, 42]
      ];

      expect(actual).toEqual(expected);
    });

    it('control values of the curve should be considered together with the direction in which the lines are drawn.', () => {
      const actual = lineTypeBase._makeSplineLinesPath(
        [
          {
            left: 582,
            top: 42,
            startTop: 346
          },
          {
            left: 87,
            top: 346,
            startTop: 346
          },
          {
            left: 334.5,
            top: 344.48,
            startTop: 346
          }
        ],
        {
          isReverseDirection: true
        }
      );
      const expected = [
        ['M', 582, 42, 'C', 582, 42],
        [18.97144613109832, 108.03284710173563, 87, 346, 52.985723065549166, 346],
        [334.5, 344.48, 334.5, 344.48]
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('makeBorderStyle()', () => {
    it('should create border type using borderColor and opacity', () => {
      const actual = lineTypeBase.makeBorderStyle('red', 0.5, 1);
      const expected = {
        stroke: 'red',
        'stroke-width': 1,
        'stroke-opacity': 0.5
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('makeOutDotStyle', () => {
    it('should create dot stroke style by opaity', () => {
      const actual = lineTypeBase.makeOutDotStyle(0.7);
      const expected = {
        'fill-opacity': 0.7,
        'stroke-opacity': 0.7,
        r: 6
      };
      expect(actual).toEqual(expected);
    });

    it('should add borderStyle information, if borderStype information exists', () => {
      const actual = lineTypeBase.makeOutDotStyle(0.5, {
        stroke: 'red',
        'stroke-width': 1,
        'stroke-opacity': 0.7
      });
      const expected = {
        'fill-opacity': 0.5,
        r: 6,
        stroke: 'red',
        'stroke-width': 1,
        'stroke-opacity': 0.7
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_getClipRectId()', () => {
    it('should create and return clipRectId, if clipRectId is not exist', () => {
      const actual = lineTypeBase._getClipRectId();

      expect(actual).not.toBeNull();
      expect(actual.indexOf('clipRectForAnimation')).toBe(0);
    });

    it('should not update clipRectId, if clipRectId exists', () => {
      const expected = lineTypeBase._getClipRectId();
      const actual = lineTypeBase._getClipRectId();

      expect(actual).toBe(expected);
    });
  });

  describe('_hideDot()', () => {
    it('should set the existing fill and stroke values.', () => {
      const paper = raphael(document.createElement('DIV'), 100, 100);
      const { dot } = lineTypeBase.renderDot(paper, 1, '#D95576', 1);
      lineTypeBase._setPrevDotAttributes(0, dot);
      spyOn(dot, 'attr');

      lineTypeBase._hideDot(dot, 0, 1);
      const [dotSetArgs] = dot.attr.calls.mostRecent().args;

      expect(dotSetArgs.fill).toBe('#D95576');
      expect(dotSetArgs.stroke).toBe('#D95576');
    });
  });

  describe('_findDotItem()', () => {
    it('index that is equal to the length of the data in the radial chart, you should look for the index at position 0.', () => {
      lineTypeBase.chartType = 'radial';

      const data = ['item1', 'item2'];
      const index = data.length;
      const actual = lineTypeBase._findDotItem(data, index);

      expect(actual).toBe('item1');
    });
  });
  describe('animate()', () => {
    it('ClipRect should always be updated to reflect x, y.', () => {
      lineTypeBase.clipRect = jasmine.createSpyObj('clipRect', ['attr', 'animate']);
      lineTypeBase.paper = raphael(document.createElement('DIV'), 100, 100);
      lineTypeBase.dimension = {
        width: 100,
        height: 100
      };
      lineTypeBase.position = {
        left: 30,
        top: 40
      };
      lineTypeBase.animate(() => {}, []);

      const [callArgument] = lineTypeBase.clipRect.attr.calls.mostRecent().args;

      expect(callArgument.x).toBe(20);
      expect(callArgument.y).toBe(30);
    });
  });
});
