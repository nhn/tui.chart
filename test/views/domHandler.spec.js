/**
 * @fileoverview test DOMHandler
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/views/domHandler.js');

describe('test DOM Handler', function() {
    it('test addClass', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        dom.addClass(el, 'test1');
        expect(el.className).toEqual('test1');
        dom.addClass(el, 'test2');
        expect(el.className).toEqual('test1 test2');
    });

    it('test removeClass', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        dom.removeClass(el, 'test1');
        expect(el.className).toEqual('');
        dom.addClass(el, 'test2 test1');
        dom.removeClass(el, 'test1');
        expect(el.className).toEqual('test2');
    });

    it('test createElement', function() {
        var el = dom.createElement('DIV');
        expect(el.nodeName).toEqual('DIV');

        el = dom.createElement('SPAN', 'test1');
        expect(el.nodeName).toEqual('SPAN');
        expect(el.className).toEqual('test1');
    });
});