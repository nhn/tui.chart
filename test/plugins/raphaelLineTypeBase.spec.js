/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineTypeBase = require('../../src/js/plugins/raphaelLineTypeBase');

describe('RaphaelLineTypeBase', function() {
    var lineTypeBase;

    beforeEach(function() {
        lineTypeBase = new RaphaelLineTypeBase();
    });

    describe('_makeLinesPath()', function() {
        it('positions의 top, left 정보를 이용하여 line graph를 그리기 위한 path를 생성합니다.', function() {
            var actual = lineTypeBase._makeLinesPath([
                    {
                        left: 10,
                        top: 10
                    }, {
                        left: 100,
                        top: 100
                    }
                ]),
                expected = ['M', 10, 10, 'L', 100, 100];

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSplineLinesPath()', function() {
        it('positions의 top, left 정보를 이용하여 spline line graph를 그리기 위한 path를 생성합니다.', function() {
            var actual = lineTypeBase._makeSplineLinesPath([
                    {
                        left: 10,
                        top: 10
                    }, {
                        left: 100,
                        top: 100
                    }
                ]),
                expected = [['M', 9, 10, 'C', 9, 10], [100, 100, 100, 100]];

            expect(actual).toEqual(expected);
        });
    });

    describe('makeBorderStyle()', function() {
        it('borderColor와 opacity 정보를 전달하여, line graph의 기본 border style을 생성합니다.', function() {
            var actual = lineTypeBase.makeBorderStyle('red', 0.5),
                expected = {
                    stroke: 'red',
                    'stroke-width': 1,
                    'stroke-opacity': 0.5
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('makeOutDotStyle', function() {
        it('opaity 전달하여, dot 외곽 style을 생성합니다.', function() {
            var actual = lineTypeBase.makeOutDotStyle(0.7),
                expected = {
                    'fill-opacity': 0.7,
                    'stroke-opacity': 0,
                    r: 3
                };
            expect(actual).toEqual(expected);
        });

        it('borderStyle 정보도 전달하면 병합하여 반환합니다.', function() {
            var actual = lineTypeBase.makeOutDotStyle(0.5, {
                    stroke: 'red',
                    'stroke-width': 1,
                    'stroke-opacity': 0.7
                }),
                expected = {
                    'fill-opacity': 0.5,
                    r: 3,
                    stroke: 'red',
                    'stroke-width': 1,
                    'stroke-opacity': 0.7
                };
            expect(actual).toEqual(expected);
        });
    });
});
