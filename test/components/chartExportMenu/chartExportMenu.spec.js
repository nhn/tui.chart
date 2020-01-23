/**
 * @fileoverview test series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ChartExportMenu from '../../../src/js/components/chartExportMenu/chartExportMenu';

describe('chartExportMenu', () => {
  it('chartTitle should have the option specified by the user.', () => {
    const chartExportMenu = new ChartExportMenu({
      options: { visible: true },
      chartOptions: {
        chartExportMenu: {
          filename: 'custom_file_name'
        }
      }
    });
    expect(chartExportMenu.exportFilename).toBe('custom_file_name');
  });

  it('_getMainSvgElemenmt() must find svg that exists under 1level of mainContainer.', () => {
    const chartExportMenu = new ChartExportMenu({
      options: { visible: true },
      chartOptions: {
        chartExportMenu: {
          filename: 'custom_file_name'
        }
      }
    });
    const mainContainer = document.createElement('div');
    const subContainer = document.createElement('div');
    const mainSvg = document.createElement('svg');
    const toolbarSvg = document.createElement('svg');

    subContainer.appendChild(toolbarSvg);
    mainContainer.appendChild(subContainer);
    mainContainer.appendChild(mainSvg);

    expect(chartExportMenu._getMainSvgElemenmt(mainContainer)).toBe(mainSvg);
  });
});
