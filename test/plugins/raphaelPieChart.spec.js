/**
 * @fileoverview Test for RaphaelPieChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphael from 'raphael';
import RaphaelPieChart from '../../src/js/plugins/raphaelPieChart';

describe('RaphaelPieChart', () => {
  let pieChart;

  beforeEach(() => {
    pieChart = new RaphaelPieChart();
    pieChart.labelInfos = {
      value: [],
      legend: []
    };
  });

  describe('renderLabels()', () => {
    it('Label set to which the filter option is applied should be applied.', () => {
      const paperContainer = document.createElement('DIV');
      const paper = raphael(paperContainer, 100, 100);

      pieChart.renderLabels({
        paper,
        theme: {},
        labelSet: [],
        dataType: 'value',
        labels: ['labelA', 'labelB', 'labelC', 'labelD', 'labelE'],
        colors: ['#000', '#000', '#000', '#000', '#000'],
        positions: [1, 2, 3, 4, 5],
        ratioValues: [0.3, 0.1, 0.1, 0.3, 0.2],
        seriesNames: ['labelA', 'labelB', 'labelC', 'labelD', 'labelE'],
        labelFilter: filterInfo => filterInfo.ratio >= 0.2
      });

      expect(pieChart.labelSet.length).toBe(3);
    });
  });
});
