/**
 * @fileoverview Test dataConverter.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var maker = require('../../src/js/helpers/boundsMaker.js'),
    defaultTheme = require('../../src/js/themes/defaultTheme.js');

describe('test boundsMaker', function() {
    it('_getValueAxisMaxLabel()', function() {
        var result = maker._getValueAxisMaxLabel([
            [20, 30, 50],
            [40, 40, 60],
            [60, 50, 10],
            [80, 10, 70]
        ]);
        expect(result).toEqual(90);
    });

    it('_getRenderedLabelsMaxSize()', function() {
        var result = maker._getRenderedLabelsMaxSize(['label1', 'label12'], {}, function(label) {
            return label.length;
        });
        expect(result).toEqual(7);
    });

    it('_getRenderedLabelsMaxWidth()', function() {
        var result = maker._getRenderedLabelsMaxWidth(['label1', 'label12'], {
            fontSize: 12,
            fontFamily: 'Verdana'
        });
        expect(result).toBeGreaterThan(42);
        expect(result).toBeLessThan(47);
    });

    it('_getRenderedLabelsMaxHeight()', function() {
        var result = maker._getRenderedLabelsMaxHeight(['label1', 'label12'], {
            fontSize: 12,
            fontFamily: 'Verdana'
        });
        expect(result).toBeGreaterThan(13);
        expect(result).toBeLessThan(16);
    });

    it('_getVerticalAxisWidth()', function() {
        var result = maker._getVerticalAxisWidth('title', ['label1', 'label12'], {
            title: {
                fontSize: 12,
                fontFamily: 'Verdana'
            },
            label: {
                fontSize: 12,
                fontFamily: 'Verdana'
            }
        });
        expect(result).toBeGreaterThan(77);
        expect(result).toBeLessThan(82);
    });

    it('_getHorizontalAxisHeight()', function() {
        var result = maker._getVerticalAxisWidth('title', ['label1', 'label12'], {
            title: {
                fontSize: 12,
                fontFamily: 'Verdana'
            },
            label: {
                fontSize: 12,
                fontFamily: 'Verdana'
            }
        });
        expect(result).toBeGreaterThan(77);
        expect(result).toBeLessThan(82);
    });

    it('getLegendAreaWidth()', function() {
        var result = maker.getLegendAreaWidth(['label1', 'label12'], {
            fontSize: 12,
            fontFamily: 'Verdana'
        });
        expect(result).toBeGreaterThan(79);
        expect(result).toBeLessThan(84);
    });

    it('make()', function() {
       var result = maker.make({
           convertData: {
               values: [
                   [20, 30, 50],
                   [40, 40, 60],
                   [60, 50, 10],
                   [80, 10, 70]
               ],
               labels: ['label1', 'label2', 'label3'],
               legendLabels: ['label1', 'label2', 'label3'],
               formatValues: [
                   [20, 30, 50],
                   [40, 40, 60],
                   [60, 50, 10],
                   [80, 10, 70]
               ]
           },
           theme: defaultTheme,
           options: {}
       });

        expect(result.chart.dimension.width && result.chart.dimension.height).toBeTruthy();
        expect(result.plot.dimension.width && result.plot.dimension.height).toBeTruthy();
        expect(result.plot.position.top && result.plot.position.right).toBeTruthy();
        expect(result.series.dimension.width && result.series.dimension.height).toBeTruthy();
        expect(result.series.position.top && result.series.position.right).toBeTruthy();
        expect(result.vAxis.dimension.width && result.vAxis.dimension.height).toBeTruthy();
        expect(result.vAxis.position.top).toBeTruthy();
        expect(result.hAxis.dimension.width && result.hAxis.dimension.height).toBeTruthy();
        expect(result.hAxis.position.top).toBeTruthy();
        expect(result.legend.position.top && result.legend.position.right).toBeTruthy();
        expect(result.tooltip.dimension.width && result.tooltip.dimension.height).toBeTruthy();
        expect(result.tooltip.position.top && result.tooltip.position.left).toBeTruthy();
    });
});