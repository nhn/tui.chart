/**
 * @fileoverview test DOMHandler
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler.js');

describe('domHandler', function() {
    describe('create()', function() {
        it('Element를 생성합니다.', function () {
            var el = dom.create('DIV');
            expect(el.nodeName).toBe('DIV');
        });

        it('ClassName을 포함한 Element 생성합니다.', function () {
            var el = dom.create('SPAN', 'test1');
            expect(el.nodeName).toBe('SPAN');
            expect(el.className).toBe('test1');
        });
    });

    describe('_getClassNames()', function() {
        it('class name을 배열 형태로 추출하여 반환합니다.', function () {
            var el = dom.create('DIV'),
                result;
            el.className = 'test1 test2';

            result = dom._getClassNames(el);

            expect(result).toEqual(['test1', 'test2']);
        });
    });

    describe('addClass()', function() {
        it('className을 추가합니다.', function () {
            var el = document.createElement('DIV');
            el.className = 'test1';
            dom.addClass(el, 'test1');
            expect(el.className).toBe('test1');
            dom.addClass(el, 'test2');
            expect(el.className).toBe('test1 test2');
        });
    });

    describe('removeClass()', function() {
        it('className을 제거합니다.', function () {
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
        it('class 존재 여부 결과 반환합니다.', function () {
            var el = dom.create('DIV', 'test1 test2'),
                result = dom.hasClass(el, 'test1');
            expect(result).toBe(true);

            result = dom.hasClass(el, 'test3');
            expect(result).toBe(false);
        });
    });

    describe('findParentByClass()', function() {
        it('className으로 부모 검색 시 결과가 없을 경우 null을 반환합니다.', function () {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test3', 'test1');
            expect(result).toBeNull();
        });

        it('className으로 부모를 검색한 결과를 반환합니다.', function () {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test1', 'test1');
            expect(result).toBe(elParent);
        });
    });

    describe('append()', function() {
        it('HTML엘리먼트로 인자를 넘길 시에는 자식 엘리먼트 하나만 추가합니다.', function () {
            var elParent = dom.create('DIV'),
                el = dom.create('SPAN');

            dom.append(elParent, el);
            expect(elParent.firstChild).toBe(el);
        });

        it('배열로 자식 엘리먼트 정보를 전달하면 여러개의 자식 엘리먼트를 순차적으로 추가합니다.', function () {
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
