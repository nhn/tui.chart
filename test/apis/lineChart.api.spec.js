/**
 * @fileoverview Test public APIs for line chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphael from 'raphael';
import dom from '../../src/js/helpers/domHandler';
import chart from '../../src/js/index';
const { lineChart: lineChartFactory } = chart;

describe('Test public APIs for line chart', () => {
  const rawData = {
    categories: [
      '01/01/2016',
      '02/01/2016',
      '03/01/2016',
      '04/01/2016',
      '05/01/2016',
      '06/01/2016',
      '07/01/2016',
      '08/01/2016',
      '09/01/2016',
      '10/01/2016',
      '11/01/2016',
      '12/01/2016'
    ],
    series: [
      {
        name: 'Seoul',
        data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6]
      },
      {
        name: 'Seattle',
        data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.4, 3.7]
      },
      {
        name: 'Sydney',
        data: [22.1, 22.0, 20.9, 18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6, 19.4, 21.2]
      },
      {
        name: 'Moskva',
        data: [-10.3, -9.1, -4.1, 4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2, -2.0, -7.5]
      },
      {
        name: 'Jungfrau',
        data: [-13.2, -13.7, -13.1, -10.3, -6.1, -3.2, 0.0, -0.1, -1.8, -4.5, -9.0, -10.9]
      }
    ]
  };
  let lineChart, plot;

  beforeEach(() => {
    const container = dom.create('DIV');
    const plotContainer = dom.create('DIV');

    lineChart = lineChartFactory(container, rawData);
    plot = lineChart.componentManager.get('plot');
    plot.paper = raphael(plotContainer, 100, 100);
    plot.paper.pushDownBackgroundToBottom = () => {};
  });

  afterEach(() => {
    plot.paper.remove();
  });

  describe('addData()', () => {
    beforeEach(() => {
      spyOn(lineChart.dataProcessor, 'addDynamicData');
    });

    it('add data', () => {
      lineChart.addData('category', [1, 2, 3]);

      expect(lineChart.dataProcessor.addDynamicData).toHaveBeenCalledWith('category', [1, 2, 3]);
    });

    it('add data, when coordinate data type', () => {
      lineChart.addData({
        legend1: 10,
        legend2: 5
      });

      expect(lineChart.dataProcessor.addDynamicData).toHaveBeenCalledWith(null, {
        legend1: 10,
        legend2: 5
      });
    });
  });

  describe('addPlotLine()', () => {
    it('add plot line', () => {
      lineChart.addPlotLine({
        value: '02/01/2016',
        color: 'red'
      });

      expect(plot.options.lines.length).toBe(1);
    });
  });

  describe('addPlotBand()', () => {
    it('add plot band', () => {
      lineChart.addPlotBand({
        range: ['03/01/2016', '04/01/2016'],
        color: 'yellow',
        opacity: 0.5
      });

      expect(plot.options.bands.length).toBe(1);
    });
  });

  describe('removePlotLine()', () => {
    it('remove plot line', () => {
      lineChart.addPlotLine({
        id: 'line1',
        value: '02/01/2016',
        color: 'red'
      });

      expect(plot.options.lines.length).toBe(1);

      lineChart.removePlotLine('line1');

      expect(plot.options.lines.length).toBe(0);
    });
  });

  describe('removePlotBand()', () => {
    it('remove plot band', () => {
      lineChart.addPlotBand({
        id: 'band1',
        range: ['03/01/2016', '04/01/2016'],
        color: 'yellow',
        opacity: 0.5
      });

      expect(plot.options.bands.length).toBe(1);

      lineChart.removePlotBand('band1');

      expect(plot.options.bands.length).toBe(0);
    });
  });
});
