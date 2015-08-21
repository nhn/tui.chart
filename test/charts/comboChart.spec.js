/**
 * @fileoverview test ComboChart
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComboChart = require('../../src/js/charts/ComboChart.js');

describe('test ComboChart', function() {
    it('_getYAxisChartTypes()', function() {
        var result = ComboChart.prototype._getYAxisChartTypes(['column', 'line']);
        expect(result).toEqual(['column', 'line']);
    });

    it('_getYAxisChartTypes() contained object option', function() {
        var result = ComboChart.prototype._getYAxisChartTypes(['column', 'line'], {
            chartType: 'line'
        });

        expect(result).toEqual(['line', 'column']);

        result = ComboChart.prototype._getYAxisChartTypes({
            column: [
                ['Legend1', 20, 30, 50]
            ],
            line: [
                ['Legend2_1', 1, 2, 3]
            ]
        }, {
            title: 'test'
        });

        expect(result).toEqual([]);
    });

    it('_getYAxisChartTypes() contained array options', function() {
        var result = ComboChart.prototype._getYAxisChartTypes(['column', 'line'], [{
            chartType: 'line'
        }]);

        expect(result).toEqual(['line', 'column']);

        result = ComboChart.prototype._getYAxisChartTypes(['column', 'line'], [{
            title: 'test'
        }]);

        expect(result).toEqual([]);
    });
});