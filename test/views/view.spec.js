/**
 * @fileoverview test basic view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('../../src/js/views/axisView.js');

describe('test View', function() {
    var view = new View();
    it('test renderDimension', function() {
        var el = view.el,
            size = {width: 500, height: 300};
        view.renderDimension(size);
        expect(el.style.width).toEqual('500px');
        expect(el.style.height).toEqual('300px');
    });

    it('test renderPosition', function() {
        var el = view.el,
            position = {top: 50, right: 50};
        view.renderPosition(position);
        expect(el.style.top).toEqual('50px');
        expect(el.style.right).toEqual('50px');
    });

    it('test rendertitle', function() {
        var elTitle = view.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
        expect(elTitle.innerHTML).toEqual('Test title');
        expect(elTitle.style.fontSize).toEqual('12px');
        expect(elTitle.style.backgroundColor).toEqual('orange');
        expect(elTitle.className).toEqual('test-title');
    });

    it('test renderBackground', function() {
        var el = view.el;
        view.renderBackground('red');
        expect(el.style.backgroundColor).toEqual('red');
    });

    it('test concatStr', function() {
        var result = view.concatStr();
        expect(result).toEqual('');

        result = view.concatStr('a', 'b', 'c');
        expect(result).toEqual('abc');
    });

    it('test makeFontCssText', function() {
        var result = view.makeFontCssText({
            fontSize: 12,
            fontFamily: 'Verdana',
            color: 'blue'
        });

        expect(result).toEqual('font-size:12px;font-family:Verdana;color:blue');
    });

    it('test getRenderedLabelWidth', function() {
        var labelWidth = view.getRenderedLabelWidth('Label1');
        expect(labelWidth).toBeGreaterThan(30);
    });

    it('test getRenderedLabelHeight', function() {
        var labelHeight = view.getRenderedLabelHeight('Label2');
        expect(labelHeight).toBeGreaterThan(12);
    });

    it('test getRenderedLabelsMaxWidth', function() {
        var data = ['a', 'abcde', 'label1', 'I am a boy.'],
            maxWidth = view.getRenderedLabelsMaxWidth(data);
        expect(maxWidth).toBeGreaterThan(50);
    });

    it('test getRenderedLabelsMaxHeight', function() {
        var data = ['a', 'abcde', 'label1', 'I am a boy.'],
            maxHeight = view.getRenderedLabelsMaxHeight(data);
        expect(maxHeight).toBeGreaterThan(12);
    });
});