/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartExportMenu = require('../../../src/js/components/chartExportMenu/chartExportMenu');

describe('chartExportMenu', function() {
    it('chartTitle should have the option specified by the user.', function() {
        var chartExportMenu = new ChartExportMenu({
            options: {visible: true},
            chartOptions: {
                chartExportMenu: {
                    filename: 'custom_file_name'
                }
            }
        });
        expect(chartExportMenu.exportFilename).toBe('custom_file_name');
    });
});
