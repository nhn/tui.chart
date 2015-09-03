/**
 * @fileoverview test DOMHandler
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../src/js/helpers/domHandler.js');

describe('domHandler', function() {
    describe('create()', function() {
        it('Element 생성', function () {
            var el = dom.create('DIV');
            expect(el.nodeName).toEqual('DIV');
        });

        it('ClassName을 포함한 Element 생성', function () {
            var el = dom.create('SPAN', 'test1');
            expect(el.nodeName).toEqual('SPAN');
            expect(el.className).toEqual('test1');
        });
    });

    describe('_getClassNames()', function() {
        it('class name을 배열 형태로 추출', function () {
            var el = dom.create('DIV'),
                result;
            el.className = 'test1 test2';

            result = dom._getClassNames(el);

            expect(result).toEqual(['test1', 'test2']);
        });
    });

    describe('addClass()', function() {
        it('className 추가', function () {
            var el = document.createElement('DIV');
            el.className = 'test1';
            dom.addClass(el, 'test1');
            expect(el.className).toEqual('test1');
            dom.addClass(el, 'test2');
            expect(el.className).toEqual('test1 test2');
        });
    });

    describe('removeClass()', function() {
        it('className 제거', function () {
            var el = document.createElement('DIV');
            el.className = 'test1';
            dom.removeClass(el, 'test1');
            expect(el.className).toEqual('');
            dom.addClass(el, 'test2');
            dom.addClass(el, 'test1');
            dom.removeClass(el, 'test1');
            expect(el.className).toEqual('test2');
        });
    });

    describe('hasClass()', function() {
        it('class 존재 여부 결과 반환', function () {
            var el = dom.create('DIV', 'test1 test2'),
                result = dom.hasClass(el, 'test1');
            expect(result).toBeTruthy();

            result = dom.hasClass(el, 'test3');
            expect(result).toBeFalsy();
        });
    });

    describe('findParentByClass()', function() {
        it('className으로 부모 검색 시 결과가 없을 경우 null 반환', function () {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test3', 'test1');
            expect(result).toBeNull();
        });

        it('className으로 부모 검색 결과 반환', function () {
            var elParent = dom.create('DIV', 'test1 test2'),
                el = dom.create('DIV'),
                result;
            elParent.appendChild(el);
            result = dom.findParentByClass(el, 'test1', 'test1');
            expect(result).toEqual(elParent);
        });
    });

    describe('append()', function() {
        it('차식 하나만 추가 할 경우', function () {
            var elParent = dom.create('DIV'),
                el = dom.create('SPAN');

            dom.append(elParent, el);
            expect(elParent.firstChild).toEqual(el);
        });

        it('배열로 자식 정보를 전달해도 추가 가능함', function () {
            var elParent = dom.create('DIV'),
                el1 = dom.create('SPAN'),
                el2 = dom.create('SPAN'),
                el3 = dom.create('SPAN');

            dom.append(elParent, [el1, el2, el3]);
            expect(elParent.childNodes[0]).toEqual(el1);
            expect(elParent.childNodes[1]).toEqual(el2);
            expect(elParent.childNodes[2]).toEqual(el3);
        });
    });
});
