/**
 * @fileoverview test DOMHandler
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DOMHandler = require('../../src/js/views/domHandler.js');

describe('test DOM Handler', function() {
    var domHandler = new DOMHandler();
    it('test addClass', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        domHandler.addClass(el, 'test1');
        expect(el.className).toEqual('test1');
        domHandler.addClass(el, 'test2');
        expect(el.className).toEqual('test1 test2');
    });

    it('test removeClass', function() {
        var el = document.createElement('DIV');
        el.className = 'test1';
        domHandler.removeClass(el, 'test1');
        expect(el.className).toEqual('');
        domHandler.addClass(el, 'test2 test1');
        domHandler.removeClass(el, 'test1');
        expect(el.className).toEqual('test2');
    });

    it('test createElement', function() {
        var el = domHandler.createElement('DIV');
        expect(el.nodeName).toEqual('DIV');

        el = domHandler.createElement('SPAN', 'test1');
        expect(el.nodeName).toEqual('SPAN');
        expect(el.className).toEqual('test1');
    });
});