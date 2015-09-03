/**
 * @fileoverview test render util
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../../src/js/helpers/renderUtil.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('renderUtil', function() {
    describe('concatStr()', function() {
        it('문자들을 인자로 전달하면 붙여진 결과를 반환함 ex) concatStr("a", "b", "c") ---> "abc"', function () {
            var result = renderUtil.concatStr();
            expect(result).toEqual('');

            result = renderUtil.concatStr('a', 'b', 'c');
            expect(result).toEqual('abc');
        });
    });

    describe('makeFontCssText()', function() {
        it('객체로 전달받은 css 속성들을 cssText 문자열로 반환', function () {
            var result = renderUtil.makeFontCssText({
                fontSize: 12,
                fontFamily: 'Verdana',
                color: 'blue'
            });

            expect(result).toEqual('font-size:12px;font-family:Verdana;color:blue');
        });
    });

    describe('_createSizeCheckEl()', function() {
        it('동적인 폰트 크기를 체크할 수 있는 HTML Element 반환', function () {
            var result = renderUtil._createSizeCheckEl(),
                elCompare = dom.create('DIV');

            elCompare.style.cssText = 'position:relative;top:10000px;left:10000px;width:1000px;height:100;line-height:1';
            expect(result.firstChild.nodeName).toEqual('SPAN');
            expect(result.style.cssText).toEqual(elCompare.style.cssText);
        });
    });

    describe('_getRenderedLabelSize()', function() {
        it('전달받은 레이블을 css속성을 포함하여 렌더링하여 사이즈 계산 후 결과 반환', function () {
            var labelWidth = renderUtil._getRenderedLabelSize('Label1', {
                fontFamily: 'Verdana'
            }, 'offsetWidth');
            expect(labelWidth).toBeGreaterThan(30);
        });
    });

    describe('getRenderedLabelWidth()', function() {
        it('렌더링된 레이블의 너비값 반환', function () {
            var labelWidth = renderUtil.getRenderedLabelWidth('Label1');
            expect(labelWidth).toBeGreaterThan(30);
        });
    });

    describe('getRenderedLabelWidth()', function() {
        it('렌더링된 레이블의 높이값 반환', function () {
            var labelHeight = renderUtil.getRenderedLabelHeight('Label2');
            expect(labelHeight).toBeGreaterThan(12);
        });
    });

    describe('renderDimension()', function() {
        it('전달 받은 Element에 전달 받은 너비, 높이값 설정', function () {
            var el = dom.create('DIV'),
                size = {width: 500, height: 300};
            renderUtil.renderDimension(el, size);
            expect(el.style.width).toEqual('500px');
            expect(el.style.height).toEqual('300px');
        });
    });

    describe('renderPosition()', function() {
        it('전달 받은 Element에 전달 받은 위치(top, left) 설정', function () {
            var el = dom.create('DIV'),
                position = {top: 50, right: 50};
            renderUtil.renderPosition(el, position);
            expect(el.style.top).toEqual('50px');
            expect(el.style.right).toEqual('50px');
        });
    });

    describe('renderBackground()', function() {
        it('전달 받은 Element에 전달 받은 배경 정보 설정', function () {
            var el = dom.create('DIV');
            renderUtil.renderBackground(el, 'red');
            expect(el.style.backgroundColor).toEqual('red');
        });
    });

    describe('renderTitle()', function() {
        it('타이틀 영역 설정 후 생성된 HTML Element 반환', function () {
            var elTitle = renderUtil.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
            expect(elTitle.innerHTML).toEqual('Test title');
            expect(elTitle.style.fontSize).toEqual('12px');
            expect(elTitle.style.backgroundColor).toEqual('orange');
            expect(elTitle.className).toEqual('test-title');
        });
    });
});
