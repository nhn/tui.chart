/**
 * @fileoverview Test for RaphaelBarChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var RaphaelBarChart = require('../../src/js/plugins/raphaelBarChart');

describe('RaphaelBarChart', function() {
    var barChart;

    beforeEach(function() {
        barChart = new RaphaelBarChart();
    });

    describe('_makeRectPoints()', function() {
        it('should create position data by boundingRect data', function() {
            var actual = barChart._makeRectPoints({
                    left: 10,
                    top: 10,
                    width: 100,
                    height: 40
                }),
                expected = {
                    leftTop: {
                        left: 10,
                        top: 10
                    },
                    rightTop: {
                        left: 110,
                        top: 10
                    },
                    rightBottom: {
                        left: 110,
                        top: 50
                    },
                    leftBottom: {
                        left: 10,
                        top: 50
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeTopLinePath()', function() {
        it('should make top line path', function() {
            var points = {
                    leftTop: {
                        left: 10,
                        top: 10
                    },
                    rightTop: {
                        left: 50,
                        top: 10
                    }
                },
                actual = barChart._makeTopLinePath(points, 'bar', {}),
                expected = 'M 10 9.5 L 50 9.5';
            expect(actual).toBe(expected);
        });

        it('should subtract 1 from top line path, when it is column chart', function() {
            var points = {
                    leftTop: {
                        left: 10,
                        top: 10
                    },
                    rightTop: {
                        left: 50,
                        top: 10
                    }
                },
                actual = barChart._makeTopLinePath(points, 'column', {
                    value: 1
                }),
                expected = 'M 9 9.5 L 50 9.5';
            expect(actual).toBe(expected);
        });

        it('should subtract 1 from top line path, when it is bar chart of negative value', function() {
            var points = {
                    leftTop: {
                        left: 10,
                        top: 10
                    },
                    rightTop: {
                        left: 50,
                        top: 10
                    }
                },
                actual = barChart._makeTopLinePath(points, 'bar', {
                    value: -1
                }),
                expected = 'M 9 9.5 L 50 9.5';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeBorderLinesPaths()', function() {
        it('should create top, right, bottom path when it is bar chart of positive value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', {
                value: 10
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).not.toBeDefined();
        });

        it('should create additional left path, if it is ranged bar chart of positive value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', {
                value: 10,
                isRange: true
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should creat top, bottom, left path, when it is bar chart of negative value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', {
                value: -10
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).not.toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should create additional right path, if it is ranged bar chart of negative value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'bar', {
                value: -10,
                isRange: true
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should creat top, right, left path, if it is column chart of positive value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', {
                value: 10
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).not.toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should create additional bottom path, if it is ranged column chart of positive value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', {
                value: 10,
                isRange: true
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should create right, bottom, left path, if it is column chart of negative value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', {
                value: -10
            });

            expect(actual.top).not.toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });

        it('should create additional top path if it is ranged column chart of negative value', function() {
            var actual = barChart._makeBorderLinesPaths({
                left: 10,
                top: 10,
                width: 100,
                height: 50
            }, 'column', {
                value: -10,
                isRange: true
            });

            expect(actual.top).toBeDefined();
            expect(actual.right).toBeDefined();
            expect(actual.bottom).toBeDefined();
            expect(actual.left).toBeDefined();
        });
    });
});
