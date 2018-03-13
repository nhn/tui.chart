/**
 * @fileoverview Test public APIs for bar chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var seriesDataImporter = require('../../src/js/helpers/seriesDataImporter');

describe('SeriesDataImporter', function() {
    var div = document.createElement('div');
    var body = document.body;

    beforeEach(function() {
        body.appendChild(div);
        div.innerHTML = ['<table id="table-data">',
            '<thead>', '<tr><th>Budget</th><th>Income</th><th>Expenses</th><th>Dept</th></tr>',
            '</thead>',
            '<tbody>',
            '<tr><td>June, 2015</td><td>5000</td><td>8000</td><td>4000</td><td>6000</td></tr>',
            '<tr><td>July, 2015</td><td>3000</td><td>1000</td><td>4000</td><td>3000</td></tr>',
            '<tr><td>August, 2015</td><td>5000</td><td>7000</td><td>6000</td><td>3000</td></tr>',
            '<tr><td>September, 2015</td><td>7000</td><td>2000</td><td>3000</td><td>1000</td></tr>',
            '<tr><td>October, 2015</td><td>6000</td><td>6000</td><td>4000</td><td>2000</td></tr>',
            '<tr><td>November, 2015</td><td>4000</td><td>3000</td><td>5000</td><td>4000</td></tr>',
            '<tr><td>December, 2015</td><td>1000</td><td>5000</td><td>7000</td><td>3000</td></tr>',
            '</tbody>', '</table>'].join('');
    });

    afterEach(function() {
        body.removeChild(div);
    });

    it('should create series data with table id.', function() {
        var importedData = seriesDataImporter.makeDataWithTable({
            elementId: 'table-data'
        });

        expect(importedData.series).toBeDefined();
        expect(importedData.series.length).toBe(4);
        expect(importedData.categories.length).toBe(7);
    });

    it('should create series data with table element.', function() {
        var importedData = seriesDataImporter.makeDataWithTable({
            element: document.getElementById('table-data')
        });

        expect(importedData.series).toBeDefined();
        expect(importedData.series.length).toBe(4);
        expect(importedData.categories.length).toBe(7);
    });

    it('should not create series data without table element.', function() {
        var importedData = seriesDataImporter.makeDataWithTable({
            element: 'just string'
        });

        expect(importedData).not.toBeDefined();
    });

    it('should not create series data without table element.', function() {
        var importedData = seriesDataImporter.makeDataWithTable({
            element: null
        });

        expect(importedData).not.toBeDefined();
    });
});
