/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */
import ChartExportMenu from '../../../src/js/components/chartExportMenu/chartExportMenu';

describe('chartExportMenu', () => {
    it('chartTitle should have the option specified by the user.', () => {
        const chartExportMenu = new ChartExportMenu({
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
