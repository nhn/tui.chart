/**
 * @fileoverview Test for TickBaseCoordinateModel.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TickBaseCoordinateModel = require('../../../src/js/components/mouseEventDetectors/tickBaseCoordinateModel');

describe('Test for TickBaseCoordinateModel', function() {
    var coordinateModel;

    beforeEach(function() {
        coordinateModel = new TickBaseCoordinateModel({
            dimension: {
                width: 200,
                height: 100
            },
            position: {
                top: 0,
                left: 0
            }}, 3, 'column', true);
    });

    describe('_makeLineTypeData()', function() {
        it('should make limit data base on middle of tick intervals when line type chart.', function() {
            var actual = coordinateModel._makeLineTypeData(199, 3),
                expected = [{min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 249}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalData()', function() {
        it('should make limit data base on tick when not line type chart.', function() {
            var actual = coordinateModel._makeNormalData(200, 3),
                expected = [{min: 0, max: 100}, {min: 100, max: 200}];
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeData()', function() {
        it('should make data from _makeLineTypeData() when line type chart.', function() {
            var actual, expected;

            coordinateModel.isLineType = true;

            actual = coordinateModel._makeData({
                dimension: {
                    width: 200,
                    height: 100
                },
                position: {
                    top: 0,
                    left: 0
                }}, 3, 'line', true);
            expected = coordinateModel._makeLineTypeData(200, 3);

            expect(actual).toEqual(expected);
        });

        it('should make data from _makeNormalData() when not line type chart.', function() {
            var actual, expected;

            coordinateModel.isLineType = false;

            actual = coordinateModel._makeData({
                dimension: {
                    width: 200,
                    height: 100
                },
                position: {
                    top: 0,
                    left: 0
                }
            }, 3, 'column', true);
            expected = coordinateModel._makeNormalData(200, 3);

            expect(actual).toEqual(expected);
        });
    });

    describe('findIndex()', function() {
        it('should find group index by mouse position(layerX).', function() {
            var actual, expected;
            actual = coordinateModel.findIndex(110);
            expected = 1;
            expect(actual).toBe(expected);
        });

        it('should return -1 if cannot find group index', function() {
            var actual, exptected;
            coordinateModel.coordinateData = [
                {
                    min: 0,
                    max: 50
                },
                {
                    min: 50,
                    max: 150
                }
            ];
            actual = coordinateModel.findIndex(210);
            exptected = -1;
            expect(actual).toBe(exptected);
        });
    });

    describe('makeRange()', function() {
        it('should set tooltip ranges to intermediate value of limit when line type chart.', function() {
            var actual, expected;

            coordinateModel.isLineType = true;
            coordinateModel.data = [
                {min: -50, max: 50}, {min: 50, max: 150}, {min: 150, max: 250}
            ];

            actual = coordinateModel.makeRange(1, 'line');
            expected = {
                start: 100,
                end: 100
            };

            expect(actual).toEqual(expected);
        });

        it('should set tooltip reanges as it is when not line type chart.', function() {
            var actual, expected;

            coordinateModel.isLineType = false;
            coordinateModel.data = [
                {min: 0, max: 100}, {min: 100, max: 200}
            ];

            actual = coordinateModel.makeRange(0);
            expected = {
                start: 0,
                end: 100
            };

            expect(actual).toEqual(expected);
        });
    });
});
