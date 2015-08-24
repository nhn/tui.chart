/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var converter = require('../../src/js/helpers/dataConverter.js');

describe('test dataConverter', function() {
    it('_pickValues()', function() {
        var result = converter._pickValues([
            ['Legend1', 20, 30, 50],
            ['Legend2', 40, 40, 60],
            ['Legend3', 60, 50, 10],
            ['Legend4', 80, 10, 70]
        ]);
        expect(result).toEqual([
            [20, 40, 60, 80],
            [30, 40, 50, 10],
            [50, 60, 10, 70]
        ]);
    });

    it('_pickLegendLabels()', function() {
        var labels = converter._pickLegendLabels([
            ['Legend1', 20, 30, 50],
            ['Legend2', 40, 40, 60],
            ['Legend3', 60, 50, 10],
            ['Legend4', 80, 10, 70]
        ]);
        expect(labels).toEqual(['Legend1', 'Legend2', 'Legend3', 'Legend4']);
    });

    it('_formatZeroFill(3, 1)', function() {
        var result = converter._formatZeroFill(3, 1);
        expect(result).toEqual('001');
    });

    it('_formatZeroFill(4, 22)', function() {
        var result = converter._formatZeroFill(4, 22);
        expect(result).toEqual('0022');
    });

    it('_formatDecimal(2, 1.1111)', function() {
        var result = converter._formatDecimal(2, 1.1111);
        expect(result).toEqual('1.11');
    });

    it('_formatDecimal(2, 1)', function() {
        var result = converter._formatDecimal(2, 1);
        expect(result).toEqual('1.00');
    });

    it('_formatComma(1000)', function() {
        var result = converter._formatComma(1000);
        expect(result).toEqual('1,000');
    });

    it('_formatComma(1000000)', function() {
        var result = converter._formatComma(1000000);
        expect(result).toEqual('1,000,000');
    });

    it('_pickMaxLenUnderPoint', function() {
        var point = converter._pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
        expect(point).toEqual(3);
    });

    it('_findFormatFunctions()', function() {
        var result = converter._findFormatFunctions();
        expect(result).toEqual([]);
    });

    it("_findFormatFunctions('0.000')", function() {
        var result = converter._findFormatFunctions('0.000');
        expect(result[0](1000)).toEqual('1000.000');
    });

    it("_findFormatFunctions('1,000')", function() {
        var result = converter._findFormatFunctions('1,000');
        expect(result[0](1000)).toEqual('1,000');
    });

    it("_findFormatFunctions('1,000.00')", function() {
        var result = converter._findFormatFunctions('1,000.00');
        expect(result.length).toEqual(2);
    });

    it("_findFormatFunctions('0001')", function() {
        var result = converter._findFormatFunctions('0001');
        expect(result[0](11)).toEqual('0011');
    });

    it('_formatValues()', function() {
        var formatFunctions = converter._findFormatFunctions('0.0'),
            result = converter._formatValues([
            [20, 40, 60, 80],
            [30, 40, 50, 10],
            [50, 60, 10, 70]
        ], formatFunctions);
        expect(result).toEqual([
            ['20.0', '40.0', '60.0', '80.0'],
            ['30.0', '40.0', '50.0', '10.0'],
            ['50.0', '60.0', '10.0', '70.0']
        ]);
    });

    it('_formatValues() for combo chart', function() {
        var formatFunctions = converter._findFormatFunctions('0.0'),
            result = converter._formatValues({
                column: [
                    [20, 40, 60, 80],
                    [30, 40, 50, 10]
                ],
                line: [
                    [50, 60, 10, 70]
                ]
            }, formatFunctions);
        expect(result).toEqual({
            column: [
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0']

            ],
            line: [
                ['50.0', '60.0', '10.0', '70.0']
            ]
        });
    });

    it('convert()', function() {
        var convertData = converter.convert({
                categories: ['cate1', 'cate2', 'cate3'],
                series: [
                    ['Legend1', 20, 30, 50],
                    ['Legend2', 40, 40, 60],
                    ['Legend3', 60, 50, 10],
                    ['Legend4', 80, 10, 70]
                ]
            }, {
                format: '0.0'
            }, 'column');
        delete convertData.formatFunctions;
        expect(convertData).toEqual({
            labels: ['cate1', 'cate2', 'cate3'],
            values: [
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ],
            joinValues: [
                [20, 40, 60, 80],
                [30, 40, 50, 10],
                [50, 60, 10, 70]
            ],
            legendLabels: ['Legend1', 'Legend2', 'Legend3', 'Legend4'],
            joinLegendLabels: [
                {
                    chartType: 'column',
                    label: 'Legend1'
                },
                {
                    chartType: 'column',
                    label: 'Legend2'
                },
                {
                    chartType: 'column',
                    label: 'Legend3'
                },
                {
                    chartType: 'column',
                    label: 'Legend4'
                }
            ],
            formattedValues: [
                ['20.0', '40.0', '60.0', '80.0'],
                ['30.0', '40.0', '50.0', '10.0'],
                ['50.0', '60.0', '10.0', '70.0']
            ]
        });
    });
});