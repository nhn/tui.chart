/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphaelRenderUtil from '../../src/js/plugins/raphaelRenderUtil';
import raphael from 'raphael';

describe('RaphaelLineTypeBase', () => {
  describe('renderText()', () => {
    it('result of decoding the HTML entity must be applied.', () => {
      const paper = raphael(document.createElement('div'), 100, 100);
      const pos = { left: 10, top: 10 };
      const actual = raphaelRenderUtil.renderText(paper, pos, '&lt;TESTMESSAGE&gt;').attrs.text;
      expect(actual).toBe('<TESTMESSAGE>');
    });
  });
  describe('getRenderedTextSize()', () => {
    it('result of decoding the HTML entity must be applied.', () => {
      const result = raphaelRenderUtil.getRenderedTextSize('aaaa', 11, 'Arial');
      const actual = { width: Math.round(result.width), height: Math.round(result.height) };

      const expected = { width: 24, height: 12 };

      expect(actual).toEqual(expected);
    });
  });
  describe('makeLinePath()', () => {
    it('should create line path using from and to position', () => {
      const actual = raphaelRenderUtil.makeLinePath(
        {
          left: 10,
          top: 10
        },
        {
          left: 100,
          top: 100
        }
      );
      const expected = ['M', 10, 10, 'L', 100, 100];
      expect(actual).toEqual(expected);
    });

    it('should subtract (line width % 2 / 2) from original value, when from position is same to `to` position from position', () => {
      const actual = raphaelRenderUtil.makeLinePath(
        {
          left: 10,
          top: 10
        },
        {
          left: 10,
          top: 10
        }
      );
      const expected = ['M', 9.5, 9.5, 'L', 9.5, 9.5];
      expect(actual).toEqual(expected);
    });
  });

  describe('getEllipsisText()', () => {
    it('should be a string value less than the set width.', () => {
      const paper = raphael(document.body, 100, 100);
      const newString = raphaelRenderUtil.getEllipsisText('get ellipsis text test', 50, {
        fontSize: 11,
        fontFamily: 'Verdana',
        color: '#000000'
      });
      const textElement = paper
        .text(0, 0, newString)
        .attr({ fontFamily: 'Verdana', color: '#000000' });

      expect(textElement.getBBox().width).toBeLessThan(50);

      textElement.remove();
      paper.remove();
    });
  });
});
