/**
 * @fileoverview Test for domHandler.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler.js');

describe('Test for domHandler', function() {
    describe('create()', function() {
        it('should creat HTML Element.', function() {
            var el = dom.create('DIV');
            expect(el.nodeName).toBe('DIV');
        });

        it('should create Element having passing className.', function() {
            var el = dom.create('SPAN', 'test1');
            expect(el.nodeName).toBe('SPAN');
            expect(el.className).toBe('test1');
        });
    });

    describe('_getClassNames()', function() {
        it('should return array of class name.', function() {
            var el = dom.create('DIV'),
                result;
            el.className = 'test1 test2';

            result = dom._getClassNames(el);

            expect(result).toEqual(['test1', 'test2']);
        });
    });

    describe('addClass()', function() {
        it('should append className', function() {
            var el = document.createElement('DIV');
            el.className = 'test1';
            dom.addClass(el, 'test1');
            expect(el.className).toBe('test1');
            dom.addClass(el, 'test2');
            expect(el.className).toBe('test1 test2');
        });
    });

    describe('removeClass()', function() {
        it('should remove className.', function() {
            var el = document.createElement('DIV');
            el.className = 'test1';
            dom.removeClass(el, 'test1');
            expect(el.className).toBe('');
            dom.addClass(el, 'test2');
            dom.addClass(el, 'test1');
            dom.removeClass(el, 'test1');
            expect(el.className).toBe('test2');
        });
    });

    describe('hasClass()', function() {
        it('should the presence or absence of a class.', function() {
            var el = dom.create('DIV', 'test1 test2'),
                result = dom.hasClass(el, 'test1');
            expect(result).toBe(true);

            result = dom.hasClass(el, 'test3');
            expect(result).toBe(false);
        });
    });

    describe('findParentByClass()', function() {
        it('should return null, when find closest parent element by class name.', function() {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test3', 'test1');
            expect(result).toBeNull();
        });

        it('should find closest parent element by class name.', function() {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test1', 'test1');
            expect(result).toBe(elParent);
        });
    });

    describe('append()', function() {
        it('should append HTML element as a child.', function() {
            var elParent = dom.create('DIV'),
                el = dom.create('SPAN');

            dom.append(elParent, el);
            expect(elParent.firstChild).toBe(el);
        });

        it('should append list of element as a child', function() {
            var elParent = dom.create('DIV'),
                el1 = dom.create('SPAN'),
                el2 = dom.create('SPAN'),
                el3 = dom.create('SPAN');

            dom.append(elParent, [el1, el2, el3]);
            expect(elParent.childNodes[0]).toBe(el1);
            expect(elParent.childNodes[1]).toBe(el2);
            expect(elParent.childNodes[2]).toBe(el3);
        });
    });
});
