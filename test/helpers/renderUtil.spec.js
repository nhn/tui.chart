/**
 * @fileoverview Test for renderUtil.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import renderUtil from '../../src/js/helpers/renderUtil.js';
import dom from '../../src/js/helpers/domHandler.js';

describe('Test for renderUtil', () => {
  describe('concatStr()', () => {
    it('should concatenate strings. ex) concatStr("a", "b", "c") ---> "abc"', () => {
      let result = renderUtil.concatStr();
      expect(result).toBe('');

      result = renderUtil.concatStr('a', 'b', 'c');
      expect(result).toBe('abc');
    });
  });

  describe('makeFontCssText()', () => {
    it('should make serialized string using css attribute object', () => {
      const result = renderUtil.makeFontCssText({
        fontSize: 12,
        fontFamily: 'Verdana',
        color: 'blue'
      });

      expect(result).toBe('font-size:12px;font-family:Verdana;color:blue');
    });
  });

  describe('_createSizeCheckEl()', () => {
    it('should make HTML Element for checking run time font size.', () => {
      const actual = renderUtil._createSizeCheckEl();

      expect(actual.className).toBe('tui-chart-size-check-element');
      expect(actual.firstChild.nodeName).toBe('SPAN');
    });
  });

  describe('_getRenderedLabelsMaxSize()', () => {
    it('should pick the largest value from execution result', () => {
      const actual = renderUtil._getRenderedLabelsMaxSize(
        ['label1', 'label12'],
        {},
        label => label.length
      );
      expect(actual).toBe(7);
    });
  });

  describe('renderDimension()', () => {
    it('should set dimension of received element.', () => {
      const el = dom.create('DIV');
      const size = { width: 500, height: 300 };
      renderUtil.renderDimension(el, size);
      expect(el.style.width).toBe('500px');
      expect(el.style.height).toBe('300px');
    });
  });

  describe('renderPosition()', () => {
    it('should set position of received element.', () => {
      const el = dom.create('DIV');
      const position = { top: 50, left: 50 };
      renderUtil.renderPosition(el, position);
      expect(el.style.top).toBe('50px');
      expect(el.style.left).toBe('50px');
    });
  });

  describe('renderBackground()', () => {
    it('should set background styel to element.', () => {
      const el = dom.create('DIV');
      renderUtil.renderBackground(el, 'red');
      expect(el.style.backgroundColor).toBe('red');
    });
  });

  describe('renderTitle()', () => {
    it('should render title by setting title text, theme style, class name.', () => {
      const elTitle = renderUtil.renderTitle(
        'Test title',
        { fontSize: 12, background: 'orange' },
        'test-title'
      );
      expect(elTitle.innerHTML).toBe('Test title');
      expect(elTitle.style.fontSize).toBe('12px');
      expect(elTitle.style.backgroundColor).toBe('orange');
      expect(elTitle.className).toBe('test-title');
    });
  });

  describe('makeMouseEventDetectorName()', () => {
    it('should make custom event name', () => {
      const actual = renderUtil.makeMouseEventDetectorName('prefix', 'value', 'suffix');
      const expected = 'prefixValueSuffix';
      expect(actual).toBe(expected);
    });
  });

  describe('formatValue()', () => {
    it('should format values using formatFunction.', () => {
      const formatFunctions = [value => `00${value}`];
      const actual = renderUtil.formatValue({
        value: 3,
        formatFunctions
      });
      const expected = '003';
      expect(actual).toEqual(expected);
    });

    it('legendName argument is present, it should be returned.', () => {
      const spy = jasmine.createSpy('spy');
      renderUtil.formatValue({
        value: 3,
        formatFunctions: [spy],
        legendName: 'newLegend'
      });
      expect(spy.calls.mostRecent().args[4]).toBe('newLegend');
    });
  });

  describe('formatValues()', () => {
    it('should format values from format values', () => {
      const formatFunctions = [value => `00${value}`, value => `${value}%`];
      const actual = renderUtil.formatValues([10, 20, 30, 40], formatFunctions);
      const expected = ['0010%', '0020%', '0030%', '0040%'];

      expect(actual).toEqual(expected);
    });
  });

  describe('formatToDecimal()', () => {
    it('should round 1.1111 to 2 decimal places', () => {
      const result = renderUtil.formatToDecimal(1.1111, 2);
      expect(result).toBe('1.11');
    });

    it('should append a decimal place to 1, when format "1.0" to 1 decimal place.', () => {
      const result = renderUtil.formatToDecimal(1, 1);
      expect(result).toBe('1.0');
    });
  });

  describe('formatToComma()', () => {
    it('should format 1000 to "1,000".', () => {
      const result = renderUtil.formatToComma(1000);
      expect(result).toBe('1,000');
    });

    it('should format 100000 to "100,000"', () => {
      const result = renderUtil.formatToComma(100000);
      expect(result).toBe('100,000');
    });

    it('should format 1000000 to "1,000,000".', () => {
      const result = renderUtil.formatToComma(1000000);
      expect(result).toBe('1,000,000');
    });

    it('should format -1000000 to "-1,000,000".', () => {
      const result = renderUtil.formatToComma(-1000000);
      expect(result).toBe('-1,000,000');
    });

    it('should not format, if number digits is less than 4', () => {
      const result = renderUtil.formatToComma(900);
      expect(result).toBe('900');
    });

    it('should not format, if number is negative and digits is less than 4', () => {
      const result = renderUtil.formatToComma(-900);
      expect(result).toBe('-900');
    });

    it('should format integer part, when number is float type', () => {
      const result = renderUtil.formatToComma(1000.123);
      expect(result).toBe('1,000.123');
    });
  });

  describe('generateClipRectId()', () => {
    let id;

    beforeEach(() => {
      id = renderUtil.generateClipRectId();
      id = Number(id.slice(20)); // 'clipRectForAnimation'.length
    });

    it('should create unique clipRectId, by increase suffix id', () => {
      const result = renderUtil.generateClipRectId();
      const expected = `clipRectForAnimation${id + 1}`;

      expect(result).toBe(expected);
    });
  });
});
