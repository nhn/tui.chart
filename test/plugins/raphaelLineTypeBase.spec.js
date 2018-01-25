/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
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

        it('posTopType이 startTop이면 position 정보에서 startTop을 추출하여 path를 생성합니다.', function() {
            var actual = lineTypeBase._makeLinesPath([
                    {
                        left: 10,
                        top: 10,
                        startTop: 0
                    }, {
                        left: 100,
                        top: 100,
                        startTop: 50
                    }
                ], 'startTop'),
                expected = ['M', 10, 0, 'L', 100, 50];

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
                expected = [['M', 10, 10, 'C', 10, 10], [100, 100, 100, 100]];

            expect(actual).toEqual(expected);
        });

        it('should be cut off left anchor that overflow chart canvas', function() {
            var actual = lineTypeBase._makeSplineLinesPath([
                    {
                        left: 87,
                        top: 318,
                        startTop: 346
                    },
                    {
                        left: 334.5,
                        top: 44,
                        startTop: 346
                    },
                    {
                        left: 582,
                        top: 54,
                        startTop: 346
                    }
                ]),
                expected = [['M', 87, 318, 'C', 87, 318],
                    [220.41745061183047, 91.95033289869701, 334.5, 44, 448.5825493881695, 44],
                    [582, 54, 582, 54]];

            expect(actual).toEqual(expected);
        });

        it('should be cut off right anchor that overflow chart canvas', function() {
            var actual = lineTypeBase._makeSplineLinesPath([
                    {
                        left: 87,
                        top: 346,
                        startTop: 346
                    },
                    {
                        left: 334.5,
                        top: 344.48,
                        startTop: 346
                    },
                    {
                        left: 582,
                        top: 42,
                        startTop: 346
                    }
                ]),
                expected = [['M', 87, 346, 'C', 87, 346],
                    [222.8332650202649, 344.48, 334.5, 344.48, 446.1667349797351, 291.14518211369244],
                    [582, 42, 582, 42]];

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

    describe('_getClipRectId()', function() {
        it('should create and return clipRectId, if clipRectId is not exist', function() {
            var actual = lineTypeBase._getClipRectId();

            expect(actual).not.toBeNull();
            expect(actual.indexOf('clipRectForAnimation')).toBe(0);
        });

        it('should not update clipRectId, if clipRectId exists', function() {
            var expected = lineTypeBase._getClipRectId();
            var actual = lineTypeBase._getClipRectId();

            expect(actual).toBe(expected);
        });
    });
});
