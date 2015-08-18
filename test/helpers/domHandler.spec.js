/**
 * @fileoverview test DOMHandler
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler.js');

describe('tes domHandler', function() {
    it('createElement()', function() {
        var el = dom.create('DIV');
        expect(el.nodeName).toEqual('DIV');
    });

    it('_getClassNames()', function() {
        var el = dom.create('DIV'),
            result;
        el.className = 'test1 test2';

        result = dom._getClassNames(el);

        expect(result).toEqual(['test1', 'test2']);
    });

    it('addClass()', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        dom.addClass(el, 'test1');
        expect(el.className).toEqual('test1');
        dom.addClass(el, 'test2');
        expect(el.className).toEqual('test1 test2');
    });

    it('removeClass()', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        dom.removeClass(el, 'test1');
        expect(el.className).toEqual('');
        dom.addClass(el, 'test2');
        dom.addClass(el, 'test1');
        dom.removeClass(el, 'test1');
        expect(el.className).toEqual('test2');
    });

    it('createElement() contained className', function() {
        var el = dom.create('SPAN', 'test1');
        expect(el.nodeName).toEqual('SPAN');
        expect(el.className).toEqual('test1');
    });

    it('hasClass()', function() {
        var el = dom.create('DIV', 'test1 test2'),
            result = dom.hasClass(el, 'test1');
        expect(result).toBeTruthy();

        result = dom.hasClass(el, 'test3');
        expect(result).toBeFalsy();
    });

    it('findParentByClass() not found', function() {
        var elParent = dom.create('DIV', 'test1 test2'),
            el = dom.create('DIV'),
            result;
        elParent.appendChild(el);
        result = dom.findParentByClass(el, 'test3', 'test1');
        expect(result).toBeNull();
    });

    it('findParentByClass() found', function() {
        var elParent = dom.create('DIV', 'test1 test2'),
            el = dom.create('DIV'),
            result;
        elParent.appendChild(el);
        result = dom.findParentByClass(el, 'test1', 'test1');
        expect(result).toEqual(elParent);
    });

    it('append()', function() {
        var elParent = dom.create('DIV'),
            el = dom.create('SPAN');

        dom.append(elParent, el);
        expect(elParent.firstChild).toEqual(el);
    });

    it('appends()', function() {
        var elParent = dom.create('DIV'),
            el1 = dom.create('SPAN'),
            el2 = dom.create('SPAN'),
            el3 = dom.create('SPAN');

        dom.appends(elParent, [el1, el2, el3]);
        expect(elParent.childNodes[0]).toEqual(el1);
        expect(elParent.childNodes[1]).toEqual(el2);
        expect(elParent.childNodes[2]).toEqual(el3);
    });
});