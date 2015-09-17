/**
 * @fileoverview test render util
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../../src/js/helpers/renderUtil.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    isMac = navigator.userAgent.indexOf('Mac') > -1,
    browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8,
    isFirefox = browser.firefox,
    isChrome = browser.chrome;

describe('renderUtil', function() {
    describe('concatStr()', function() {
        it('문자들을 인자로 전달하면 붙여진 결과를 반환합니다. ex) concatStr("a", "b", "c") ---> "abc"', function () {
            var result = renderUtil.concatStr();
            expect(result).toEqual('');

            result = renderUtil.concatStr('a', 'b', 'c');
            expect(result).toEqual('abc');
        });
    });

    describe('makeFontCssText()', function() {
        it('객체로 전달받은 css 속성들을 cssText 문자열로 변환하여 반환합니다.', function () {
            var result = renderUtil.makeFontCssText({
                fontSize: 12,
                fontFamily: 'Verdana',
                color: 'blue'
            });

            expect(result).toEqual('font-size:12px;font-family:Verdana;color:blue');
        });
    });

    describe('_createSizeCheckEl()', function() {
        it('동적인 폰트 크기를 체크할 수 있는 HTML Element를 반환합니다.', function () {
            var result = renderUtil._createSizeCheckEl(),
                elCompare = dom.create('DIV');

            elCompare.style.cssText = 'position:relative;top:10000px;left:10000px;width:1000px;height:100;line-height:1';
            expect(result.firstChild.nodeName).toEqual('SPAN');
            expect(result.style.cssText).toEqual(elCompare.style.cssText);
        });
    });

    describe('_getRenderedLabelSize()', function() {
        it('전달받은 레이블을 테마 속성을 포함하여 렌더링하여 사이즈 계산 후 결과를 반환합니다.', function () {
            var labelSize = renderUtil._getRenderedLabelSize('Label1', {
                fontFamily: 'Verdana',
                fontSize: 12
            }, 'offsetWidth');

            if (isIE8 || isFirefox) {
                expect(labelSize).toEqual(39);
            } else if (isMac && isChrome) {
                expect(labelSize).toEqual(37);
            } else {
                expect(labelSize).toEqual(36);
            }
        });
    });

    describe('getRenderedLabelWidth()', function() {
        it('렌더링된 레이블의 너비값을 반환합니다.', function () {
            var labelWidth = renderUtil.getRenderedLabelWidth('Label1', {
                fontFamily: 'Verdana',
                fontSize: 12
            });

            if (isIE8 || isFirefox) {
                expect(labelWidth).toEqual(39);
            } else if (isMac && isChrome) {
                expect(labelWidth).toEqual(37);
            } else {
                expect(labelWidth).toEqual(36);
            }
        });
    });

    describe('getRenderedLabelWidth()', function() {
        it('렌더링된 레이블의 높이값을 반환합니다.', function () {
            var labelHeight = renderUtil.getRenderedLabelHeight('Label2', {
                fontFamily: 'Verdana',
                fontSize: 12
            });

            if (isIE8) {
                expect(labelHeight).toEqual(11);
            } else {
                expect(labelHeight).toEqual(12);
            }
        });
    });

    describe('renderDimension()', function() {
        it('전달 받은 Element css에 전달 받은 너비, 높이 값을 설정합니다.', function () {
            var el = dom.create('DIV'),
                size = {width: 500, height: 300};
            renderUtil.renderDimension(el, size);
            expect(el.style.width).toEqual('500px');
            expect(el.style.height).toEqual('300px');
        });
    });

    describe('renderPosition()', function() {
        it('전달 받은 Element style에 전달 받은 위치(top, left)값을 설정합니다.', function () {
            var el = dom.create('DIV'),
                position = {top: 50, right: 50};
            renderUtil.renderPosition(el, position);
            expect(el.style.top).toEqual('50px');
            expect(el.style.right).toEqual('50px');
        });
    });

    describe('renderBackground()', function() {
        it('전달 받은 Element style에 전달 받은 배경 정보를 설정합니다.', function () {
            var el = dom.create('DIV');
            renderUtil.renderBackground(el, 'red');
            expect(el.style.backgroundColor).toEqual('red');
        });
    });

    describe('renderTitle()', function() {
        it('전달된 title, 테마, className 정보로 타이틀 영역 설정한 후 생성된 HTML Element을 반환합니다.', function () {
            var elTitle = renderUtil.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
            expect(elTitle.innerHTML).toEqual('Test title');
            expect(elTitle.style.fontSize).toEqual('12px');
            expect(elTitle.style.backgroundColor).toEqual('orange');
            expect(elTitle.className).toEqual('test-title');
        });
    });
});
