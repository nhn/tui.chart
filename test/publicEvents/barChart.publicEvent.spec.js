/**
 * @fileoverview Test user events for bar chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import dom from '../../src/js/helpers/domHandler';
import chart from '../../src/js/index';
const barChartFactory = chart.barChart;

describe('Test user events for bar chart', () => {
  const rawData = {
    categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
    series: [
      {
        name: 'Budget',
        data: [5000, 3000, 5000, 7000, 6000, 4000]
      },
      {
        name: 'Income',
        data: [8000, 1000, 7000, 2000, 5000, 3000]
      },
      {
        name: 'Expenses',
        data: [4000, 4000, 6000, 3000, 4000, 5000]
      },
      {
        name: 'Debt',
        data: [6000, 3000, 3000, 1000, 2000, 4000]
      }
    ]
  };
  let barChart;

  beforeEach(() => {
    const container = dom.create('DIV');

    barChart = barChartFactory(container, rawData, {
      series: {
        allowSelect: true
      }
    });
  });

  describe('selectSeries', () => {
    it('select series', done => {
      const mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

      mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj(
        'mouseEventDetectorContainer',
        ['getBoundingClientRect']
      );
      mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 40,
        top: 70,
        right: 460,
        bottom: 390
      });

      barChart.on('selectSeries', info => {
        expect(info.chartType).toBe('bar');
        expect(info.legend).toBe('Income');
        expect(info.legendIndex).toBe(1);
        expect(info.index).toBe(0);

        done();
      });

      mouseEventDetector._onClick({
        clientX: 100,
        clientY: 100
      });
    });
  });

  describe('unselectSeries', () => {
    it('unselect series', done => {
      const mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

      mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj(
        'mouseEventDetectorContainer',
        ['getBoundingClientRect']
      );
      mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 40,
        top: 70,
        right: 460,
        bottom: 390
      });

      barChart.on('unselectSeries', info => {
        expect(info.chartType).toBe('bar');
        expect(info.legend).toBe('Income');
        expect(info.legendIndex).toBe(1);
        expect(info.index).toBe(0);

        done();
      });

      // select
      mouseEventDetector._onClick({
        clientX: 100,
        clientY: 100
      });

      setTimeout(() => {
        // unselect
        mouseEventDetector._onClick({
          clientX: 100,
          clientY: 100
        });
      });
    });
  });

  describe('selectLegend', () => {
    it('select legend', done => {
      const legend = barChart.componentManager.get('legend');

      barChart.on('selectLegend', info => {
        expect(info).toEqual({
          chartType: 'bar',
          legend: 'Expenses',
          index: 2
        });

        done();
      });

      legend._selectLegend(2);
    });
  });

  describe('beforeShowTooltip', () => {
    it('before show tooltip', done => {
      const mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

      mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj(
        'mouseEventDetectorContainer',
        ['getBoundingClientRect']
      );
      mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 40,
        top: 70,
        right: 460,
        bottom: 390
      });

      barChart.on('beforeShowTooltip', info => {
        expect(info.chartType).toBe('bar');
        expect(info.legend).toBe('Income');
        expect(info.legendIndex).toBe(1);
        expect(info.index).toBe(0);

        done();
      });

      mouseEventDetector._onMousemove({
        clientX: 100,
        clientY: 100
      });
    });
  });

  describe('afterShowTooltip', () => {
    it('after show tooltip', done => {
      const mouseEventDetector = barChart.componentManager.get('mouseEventDetector');

      mouseEventDetector.mouseEventDetectorContainer = jasmine.createSpyObj(
        'mouseEventDetectorContainer',
        ['getBoundingClientRect']
      );
      mouseEventDetector.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
        left: 40,
        top: 70,
        right: 460,
        bottom: 390
      });

      barChart.on('afterShowTooltip', info => {
        expect(info.chartType).toBe('bar');
        expect(info.legend).toBe('Income');
        expect(info.legendIndex).toBe(1);
        expect(info.index).toBe(0);
        expect(info.element).toBeDefined();
        expect(info.position.left).toBeDefined(true);
        expect(info.position.top).toBeDefined(true);

        done();
      });

      mouseEventDetector._onMousemove({
        clientX: 100,
        clientY: 100
      });
    });
  });
});
