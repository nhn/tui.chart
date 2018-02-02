/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelLineTypeBase = require('../../src/js/plugins/raphaelLineTypeBase');
var raphael = require('raphael');

describe('RaphaelLineTypeBase', function() {
    var lineTypeBase;

    beforeEach(function() {
        lineTypeBase = new RaphaelLineTypeBase();
    });

    describe('_makeLinesPath()', function() {
        it('should create path usgin top, left data', function() {
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

        it('should create path using position.startTop, if posTopType is startTop', function() {
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
        it('should create spline path using top, left data', function() {
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
        it('should create border type using borderColor and opacity', function() {
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
        it('should create dot stroke style by opaity', function() {
            var actual = lineTypeBase.makeOutDotStyle(0.7),
                expected = {
                    'fill-opacity': 0.7,
                    'stroke-opacity': 0,
                    r: 3
                };
            expect(actual).toEqual(expected);
        });

        it('should add borderStyle information, if borderStype information exists', function() {
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

    describe('_hideDot()', function() {
        it('should set the existing fill and stroke values.', function() {
            var paper = raphael(document.createElement('DIV'), 100, 100);
            var dot = lineTypeBase.renderDot(paper, 1, '#D95576', 1).dot;
            var dotSetArgs;
            lineTypeBase._setPrevDotAttributes(0, dot);
            spyOn(dot, 'attr');

            lineTypeBase._hideDot(dot, 0, 1);
            dotSetArgs = dot.attr.calls.mostRecent().args[0];

            expect(dotSetArgs.fill).toBe('#D95576');
            expect(dotSetArgs.stroke).toBe('#D95576');
        });
    });
});
