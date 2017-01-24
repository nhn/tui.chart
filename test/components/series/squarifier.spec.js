/**
 * @fileoverview test for squarifier.js
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var squarifier = require('../../../src/js/components/series/squarifier');

describe('test for squarifier', function() {
    describe('_calculateScale()', function() {
        it('calculate scale for calculating weight', function() {
            var actual = squarifier._calculateScale([6, 6, 4, 3, 2, 2, 1], 600, 400);

            expect(actual).toBe(10000);
        });
    });

    describe('_makeBaseData()', function() {
        it('make base data for creating squarified bounds', function() {
            var seriesItems = [
                {
                    id: 'id_0',
                    value: 4
                },
                {
                    id: 'id_1',
                    value: 2
                }
            ];
            var actual = squarifier._makeBaseData(seriesItems, 600, 200);
            var expected = [{
                id: 'id_0',
                weight: 80000
            }, {
                id: 'id_1',
                weight: 40000
            }];

            expect(actual).toEqual(expected);
        });

        it('base data is sorted weight desc', function() {
            var seriesItems = [
                {
                    id: 'id_0',
                    value: 2
                },
                {
                    id: 'id_1',
                    value: 4
                }
            ];
            var actual = squarifier._makeBaseData(seriesItems, 600, 200);
            var expected = [{
                id: 'id_1',
                weight: 80000
            }, {
                id: 'id_0',
                weight: 40000
            }];

            expect(actual).toEqual(expected);
        });
    });

    describe('_changedStackDirection()', function() {
        it('if a beforeWorst is below a newWorst, returns true', function() {
            var actual = squarifier._changedStackDirection(120000, [60000, 60000], 400, 40000);

            expect(actual).toBe(true);
        });

        it('if a beforeWorst is more than a newWorst, returns false', function() {
            var actual = squarifier._changedStackDirection(60000, [60000], 400, 60000);

            expect(actual).toBe(false);
        });
    });

    describe('_isVerticalStack()', function() {
        it('if height is less than width, returns true', function() {
            var actual = squarifier._isVerticalStack({
                width: 600,
                height: 400
            });

            expect(actual).toBe(true);
        });

        it('if height is width or over, returns false', function() {
            var actual = squarifier._isVerticalStack({
                width: 400,
                height: 600
            });

            expect(actual).toBe(false);
        });
    });

    describe('_selectBaseSize()', function() {
        it('if height is less than width, returns width', function() {
            var actual = squarifier._selectBaseSize({
                width: 600,
                height: 400
            });

            expect(actual).toBe(400);
        });

        it('if height is greater than or equal to width, returns height', function() {
            var actual = squarifier._selectBaseSize({
                width: 400,
                height: 600
            });

            expect(actual).toBe(400);
        });
    });

    describe('_calculateFixedSize()', function() {
        it('calculate fixed size', function() {
            var actual = squarifier._calculateFixedSize(400, 120000);

            expect(actual).toBe(300);
        });

        it('if sum is undefined, creating sum from row', function() {
            var sum;
            var actual = squarifier._calculateFixedSize(400, sum, [
                {
                    weight: 60000
                },
                {
                    weight: 60000
                }
            ]);

            expect(actual).toBe(300);
        });
    });

    describe('_addBounds()', function() {
        it('call a callback function like a row length', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var callback = jasmine.createSpy('callback');

            squarifier._addBounds(0, row, 400, callback);

            expect(callback).toHaveBeenCalledTimes(3);
        });

        it('passes calculated dynamic size and stored position to callback function when call the callback', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var callback = jasmine.createSpy('callback');

            squarifier._addBounds(0, row, 400, callback);

            expect(callback).toHaveBeenCalledWith(150, 0, 'id_0');
            expect(callback).toHaveBeenCalledWith(150, 150, 'id_1');
            expect(callback).toHaveBeenCalledWith(100, 300, 'id_2');
        });
    });

    describe('_addBoundsForVerticalStack()', function() {
        beforeEach(function() {
            spyOn(squarifier, '_addBound');
        });

        it('call a _addBound function like a row length', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var baseBound = {
                left: 0,
                top: 0
            };

            squarifier._addBoundsForVerticalStack(row, baseBound, 400, 160000);

            expect(squarifier._addBound).toHaveBeenCalledTimes(3);
        });

        it('passes calculated bound(left, top, width, height) to _addBound function when call the _addBound', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var baseBound = {
                left: 0,
                top: 0
            };

            squarifier._addBoundsForVerticalStack(row, baseBound, 400, 160000);

            expect(squarifier._addBound).toHaveBeenCalledWith(0, 0, 400, 150, 'id_0');
            expect(squarifier._addBound).toHaveBeenCalledWith(0, 150, 400, 150, 'id_1');
            expect(squarifier._addBound).toHaveBeenCalledWith(0, 300, 400, 100, 'id_2');
        });
    });

    describe('_addBoundsForHorizontalStack()', function() {
        beforeEach(function() {
            spyOn(squarifier, '_addBound');
        });

        it('call a _addBound function like a row length', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var baseBound = {
                left: 0,
                top: 0
            };

            squarifier._addBoundsForHorizontalStack(row, baseBound, 400, 160000);

            expect(squarifier._addBound).toHaveBeenCalledTimes(3);
        });

        it('passes calculated bound(left, top, width, height) to _addBound function when call the _addBound', function() {
            var row = [
                {
                    id: 'id_0',
                    weight: 60000
                },
                {
                    id: 'id_1',
                    weight: 60000
                },
                {
                    id: 'id_2',
                    weight: 40000
                }
            ];
            var baseBound = {
                left: 0,
                top: 0
            };

            squarifier._addBoundsForHorizontalStack(row, baseBound, 400, 160000);

            expect(squarifier._addBound).toHaveBeenCalledWith(0, 0, 150, 400, 'id_0');
            expect(squarifier._addBound).toHaveBeenCalledWith(150, 0, 150, 400, 'id_1');
            expect(squarifier._addBound).toHaveBeenCalledWith(300, 0, 100, 400, 'id_2');
        });
    });

    describe('_getAddingBoundsFunction()', function() {
        it('if type of vertical stack, returns _addBoundsForVerticalStack', function() {
            spyOn(squarifier, '_addBoundsForVerticalStack');

            squarifier._getAddingBoundsFunction({
                width: 600,
                height: 400
            })();

            expect(squarifier._addBoundsForVerticalStack).toHaveBeenCalled();
        });

        it('if not type of vertical stack, returns _addBoundsForHorizontalStack', function() {
            spyOn(squarifier, '_addBoundsForHorizontalStack');

            squarifier._getAddingBoundsFunction({
                width: 400,
                height: 600
            })();

            expect(squarifier._addBoundsForHorizontalStack).toHaveBeenCalled();
        });
    });

    describe('squarify', function() {
        it('if executing squarify function, creating squarified bounds', function() {
            var actual, expected;

            actual = squarifier.squarify({
                width: 600,
                height: 400,
                left: 0,
                top: 0
            }, [
                {
                    id: 'id_0',
                    value: 6
                },
                {
                    id: 'id_1',
                    value: 6
                },
                {
                    id: 'id_2',
                    value: 4
                },
                {
                    id: 'id_3',
                    value: 3
                },
                {
                    id: 'id_4',
                    value: 2
                },
                {
                    id: 'id_5',
                    value: 2
                },
                {
                    id: 'id_6',
                    value: 1
                }
            ]);

            expected = {
                'id_0': {left: 0, top: 0, width: 300, height: 200},
                'id_1': {left: 0, top: 200, width: 300, height: 200},
                'id_2': {left: 300, top: 0, width: 171.42857142857142, height: 233.33333333333334},
                'id_3': {left: 471.42857142857144, top: 0, width: 128.57142857142856, height: 233.33333333333334},
                'id_4': {left: 300, top: 233.33333333333334, width: 120, height: 166.66666666666666},
                'id_5': {left: 420, top: 233.33333333333334, width: 120, height: 166.66666666666666},
                'id_6': {left: 540, top: 233.33333333333334, width: 60, height: 166.66666666666666}
            };

            expect(actual).toEqual(expected);
        });
    });
});
