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

    describe('makeLinePath()', function() {
        it('from position, to position을 이용하여 line graph를 그리기 위한 line path를 생성합니다.', function() {
            var actual = lineTypeBase.makeLinePath(
                    {
                        left: 10,
                        top: 10
                    }, {
                        left: 100,
                        top: 100
                    }
                ),
                expected = {
                    start: 'M9.5 9.5L9.5 9.5',
                    end: 'M10 10L100 100'
                };
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
                    r: 4
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
                    r: 4,
                    stroke: 'red',
                    'stroke-width': 1,
                    'stroke-opacity': 0.7
                };
            expect(actual).toEqual(expected);
        });
    });
});
