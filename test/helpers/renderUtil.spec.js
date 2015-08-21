/**
 * @fileoverview test render util
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../../src/js/helpers/renderUtil.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('test renderUtil', function() {
    it('concatStr()', function() {
        var result = renderUtil.concatStr();
        expect(result).toEqual('');

        result = renderUtil.concatStr('a', 'b', 'c');
        expect(result).toEqual('abc');
    });

    it('makeFontCssText()', function() {
        var result = renderUtil.makeFontCssText({
            fontSize: 12,
            fontFamily: 'Verdana',
            color: 'blue'
        });

        expect(result).toEqual('font-size:12px;font-family:Verdana;color:blue');
    });

    it('_createSizeCheckEl', function() {
        var result = renderUtil._createSizeCheckEl(),
            elCompare = dom.create('DIV');

        elCompare.style.cssText = 'position:relative;top:10000px;left:10000px;line-height:1';
        expect(result.firstChild.nodeName).toEqual('SPAN');
        expect(result.style.cssText).toEqual(elCompare.style.cssText);
    });

    it('_getRenderedLabelSize()', function() {
        var labelWidth = renderUtil._getRenderedLabelSize('Label1', {
            fontFamily: 'Verdana'
        }, 'offsetWidth');
        expect(labelWidth).toBeGreaterThan(30);
    });

    it('getRenderedLabelWidth()', function() {
        var labelWidth = renderUtil.getRenderedLabelWidth('Label1');
        expect(labelWidth).toBeGreaterThan(30);
    });

    it('getRenderedLabelHeight()', function() {
        var labelHeight = renderUtil.getRenderedLabelHeight('Label2');
        expect(labelHeight).toBeGreaterThan(12);
    });

    it('renderDimension()', function() {
        var el = dom.create('DIV'),
            size = {width: 500, height: 300};
        renderUtil.renderDimension(el, size);
        expect(el.style.width).toEqual('500px');
        expect(el.style.height).toEqual('300px');
    });

    it('renderPosition()', function() {
        var el = dom.create('DIV'),
            position = {top: 50, right: 50};
        renderUtil.renderPosition(el, position);
        expect(el.style.top).toEqual('50px');
        expect(el.style.right).toEqual('50px');
    });

    it('renderBackground()', function() {
        var el = dom.create('DIV');
        renderUtil.renderBackground(el, 'red');
        expect(el.style.backgroundColor).toEqual('red');
    });

    it('renderTitle()', function() {
        var elTitle = renderUtil.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
        expect(elTitle.innerHTML).toEqual('Test title');
        expect(elTitle.style.fontSize).toEqual('12px');
        expect(elTitle.style.backgroundColor).toEqual('orange');
        expect(elTitle.className).toEqual('test-title');
    });
});