/**
 * @fileoverview test render util
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../../src/js/helpers/renderUtil.js'),
    dom = require('../../src/js/helpers/domHandler.js');

var isMac = navigator.userAgent.indexOf('Mac') > -1,
    browser = tui.util.browser,
    isOldBrowser = browser.msie && browser.version <= 8,
    isFirefox = browser.firefox,
    isChrome = browser.chrome;

describe('renderUtil', function() {
    describe('concatStr()', function() {
        it('문자들을 인자로 전달하면 붙여진 결과를 반환합니다. ex) concatStr("a", "b", "c") ---> "abc"', function () {
            var result = renderUtil.concatStr();
            expect(result).toBe('');

            result = renderUtil.concatStr('a', 'b', 'c');
            expect(result).toBe('abc');
        });
    });

    describe('makeFontCssText()', function() {
        it('객체로 전달받은 css 속성들을 cssText 문자열로 변환하여 반환합니다.', function () {
            var result = renderUtil.makeFontCssText({
                fontSize: 12,
                fontFamily: 'Verdana',
                color: 'blue'
            });

            expect(result).toBe('font-size:12px;font-family:Verdana;color:blue');
        });
    });

    describe('_createSizeCheckEl()', function() {
        it('동적인 폰트 크기를 체크할 수 있는 HTML Element를 반환합니다.', function () {
            var actual = renderUtil._createSizeCheckEl();

            expect(actual.className).toBe('tui-chart-size-check-element');
            expect(actual.firstChild.nodeName).toBe('SPAN');
        });
    });

    describe('_getRenderedLabelSize()', function() {
        it('전달받은 레이블을 테마 속성을 포함하여 렌더링하여 사이즈 계산 후 결과를 반환합니다.', function () {
            var atual = renderUtil._getRenderedLabelSize('Label1', {
                fontFamily: 'Verdana',
                fontSize: 12
            }, 'offsetWidth');

            if (isOldBrowser || isFirefox) {
                expect(atual).toBe(42);
            } else if (isMac && isChrome) {
                expect(atual).toBe(40);
            } else {
                expect(atual).toBe(39);
            }
        });
    });

    describe('getRenderedLabelWidth()', function() {
        it('렌더링된 레이블의 너비값을 반환합니다.', function () {
            var actual = renderUtil.getRenderedLabelWidth('Label1', {
                fontFamily: 'Verdana',
                fontSize: 12
            });

            if (isOldBrowser || isFirefox) {
                expect(actual).toBe(42);
            } else if (isMac && isChrome) {
                expect(actual).toBe(40);
            } else {
                expect(actual).toBe(39);
            }
        });
    });

    describe('getRenderedLabelHeight()', function() {
        it('렌더링된 레이블의 높이값을 반환합니다.', function () {
            var actual = renderUtil.getRenderedLabelHeight('Label2', {
                fontFamily: 'Verdana',
                fontSize: 12
            });

            if (isOldBrowser) {
                expect(actual).toBe(14);
            } else {
                expect(actual).toBe(15);
            }
        });
    });

    describe('_getRenderedLabelsMaxSize()', function() {
        it('인자로 전달하는 레이블들을 전달한 함수로 실행하여 가장 큰 값을 반환합니다.', function () {
            var acutal = renderUtil._getRenderedLabelsMaxSize(['label1', 'label12'], {}, function (label) {
                return label.length;
            });
            expect(acutal).toBe(7);
        });
    });

    describe('getRenderedLabelsMaxWidth()', function() {
        it('인자로 전달하는 레이블들의 렌더링된 레이블의 최대 너비를 반환합니다.', function () {
            var acutal = renderUtil.getRenderedLabelsMaxWidth(['Label1', 'Label']);

            if (isFirefox) {
                expect(acutal).toBe(37);
            } else if (isOldBrowser || (isMac && isChrome)) {
                expect(acutal).toBe(32);
            } else if (isChrome) {
                expect(acutal).toBe(36);
            } else {
                expect(acutal).toBe(33);
            }
        });
    });

    describe('getRenderedLabelsMaxHeight()', function() {
        it('인자로 전달하는 레이블들의 렌더링된 레이블의 최대 높이를 반환합니다.', function () {
            var acutal = renderUtil.getRenderedLabelsMaxHeight(['Label1', 'Label']);

            if (isFirefox) {
                expect(acutal).toBe(13);
            } else if (isOldBrowser || (isMac && isChrome)) {
                expect(acutal).toBe(15);
            } else if (isChrome) {
                expect(acutal).toBe(16);
            } else {
                expect(acutal).toBe(14);
            }
        });
    });

    describe('renderDimension()', function() {
        it('전달 받은 Element css에 전달 받은 너비, 높이 값을 설정합니다.', function () {
            var el = dom.create('DIV'),
                size = {width: 500, height: 300};
            renderUtil.renderDimension(el, size);
            expect(el.style.width).toBe('500px');
            expect(el.style.height).toBe('300px');
        });
    });

    describe('renderPosition()', function() {
        it('전달 받은 Element style에 전달 받은 위치(top, left)값을 설정합니다.', function () {
            var el = dom.create('DIV'),
                position = {top: 50, left: 50};
            renderUtil.renderPosition(el, position);
            expect(el.style.top).toBe('50px');
            expect(el.style.left).toBe('50px');
        });
    });

    describe('renderBackground()', function() {
        it('전달 받은 Element style에 전달 받은 배경 정보를 설정합니다.', function () {
            var el = dom.create('DIV');
            renderUtil.renderBackground(el, 'red');
            expect(el.style.backgroundColor).toBe('red');
        });
    });

    describe('renderTitle()', function() {
        it('전달된 title, 테마, className 정보로 타이틀 영역 설정한 후 생성된 HTML Element을 반환합니다.', function () {
            var elTitle = renderUtil.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
            expect(elTitle.innerHTML).toBe('Test title');
            expect(elTitle.style.fontSize).toBe('12px');
            expect(elTitle.style.backgroundColor).toBe('orange');
            expect(elTitle.className).toBe('test-title');
        });
    });

    describe('makeCustomEventName()', function() {
        it('커스텀 이벤트명을 생성합니다.', function() {
            var actual = renderUtil.makeCustomEventName('prefix', 'value', 'suffix'),
                expected = 'prefixValueSuffix';
            expect(actual).toBe(expected);
        });
    });

    describe('formatValue()', function() {
        it('두번째인자인 포맷함수를 이용하여 첫번째 인자인 값을 포맷팅합니다.', function() {
            var actual = renderUtil.formatValue(3, [function(value) {
                    return '00' + value;
                }]),
                expected = '003';
            expect(actual).toEqual(expected);
        });
    });
});
