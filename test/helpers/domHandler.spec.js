/**
 * @fileoverview Test for domHandler.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import dom from '../../src/js/helpers/domHandler.js';

describe('Test for domHandler', () => {
  describe('create()', () => {
    it('should creat HTML Element.', () => {
      const el = dom.create('DIV');
      expect(el.nodeName).toBe('DIV');
    });

    it('should create Element having passing className.', () => {
      const el = dom.create('SPAN', 'test1');
      expect(el.nodeName).toBe('SPAN');
      expect(el.className).toBe('test1');
    });
  });

  describe('_getClassNames()', () => {
    it('should return array of class name.', () => {
      const el = dom.create('DIV');
      el.className = 'test1 test2';

      const result = dom._getClassNames(el);

      expect(result).toEqual(['test1', 'test2']);
    });
  });

  describe('addClass()', () => {
    it('should append className', () => {
      const el = document.createElement('DIV');
      el.className = 'test1';
      dom.addClass(el, 'test1');
      expect(el.className).toBe('test1');
      dom.addClass(el, 'test2');
      expect(el.className).toBe('test1 test2');
    });
  });

  describe('removeClass()', () => {
    it('should remove className.', () => {
      const el = document.createElement('DIV');
      el.className = 'test1';
      dom.removeClass(el, 'test1');
      expect(el.className).toBe('');
      dom.addClass(el, 'test2');
      dom.addClass(el, 'test1');
      dom.removeClass(el, 'test1');
      expect(el.className).toBe('test2');
    });
  });

  describe('hasClass()', () => {
    it('should the presence or absence of a class.', () => {
      const el = dom.create('DIV', 'test1 test2');
      let result = dom.hasClass(el, 'test1');
      expect(result).toBe(true);

      result = dom.hasClass(el, 'test3');
      expect(result).toBe(false);
    });
  });

  describe('findParentByClass()', () => {
    it('should return null, when find closest parent element by class name.', () => {
      const elParent = dom.create('DIV', 'test1 test2');
      const el = dom.create('DIV');
      elParent.appendChild(el);
      const result = dom.findParentByClass(el, 'test3', 'test1');
      expect(result).toBeNull();
    });

    it('should find closest parent element by class name.', () => {
      const elParent = dom.create('DIV', 'test1 test2');
      const el = dom.create('DIV');
      elParent.appendChild(el);
      const result = dom.findParentByClass(el, 'test1', 'test1');
      expect(result).toBe(elParent);
    });
  });

  describe('append()', () => {
    it('should append HTML element as a child.', () => {
      const elParent = dom.create('DIV');
      const el = dom.create('SPAN');

      dom.append(elParent, el);
      expect(elParent.firstChild).toBe(el);
    });

    it('should append list of element as a child', () => {
      const elParent = dom.create('DIV');
      const el1 = dom.create('SPAN');
      const el2 = dom.create('SPAN');
      const el3 = dom.create('SPAN');

      dom.append(elParent, [el1, el2, el3]);
      expect(elParent.childNodes[0]).toBe(el1);
      expect(elParent.childNodes[1]).toBe(el2);
      expect(elParent.childNodes[2]).toBe(el3);
    });
  });
});
