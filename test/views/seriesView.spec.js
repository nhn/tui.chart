/**
 * @fileoverview test series view
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var SeriesView = require('../../src/js/views/seriesView.js'),
    SeriesModel = require('../../src/js/models/seriesModel.js');

var isIE8 = window.navigator.userAgent.indexOf('MSIE 8.0') > -1;

describe('test seriesView', function() {
    var data = {
            values: [[20], [40]],
            scale: {min: 0, max: 160 },
            lastColors: ['red', 'ornage', 'yellow', 'green'],
        },
        options = {
            bars: 'vertical',
            chartType: 'bar'
        },
        bound = {
            dimension: {width: 200, height: 100},
            position: {top: 50, right: 50}
        },
        theme = {
            colors: ['blue']
        },
        seriesModel = new SeriesModel(data);

    it('test render', function() {
        var seriesView = new SeriesView(seriesModel, options, theme),
            elSeries = seriesView.render(bound);

        expect(elSeries.className.indexOf('series-area') > -1).toBeTruthy();
        expect(elSeries.style.width).toEqual('200px');
        expect(elSeries.style.height).toEqual('100px');

        expect(elSeries.style.top).toEqual('49px');

        if (isIE8) {
            expect(elSeries.style.right).toEqual('50px');
        } else {
            expect(elSeries.style.right).toEqual('49px');
        }

        expect(!!elSeries.firstChild).toBeTruthy();
    });

});