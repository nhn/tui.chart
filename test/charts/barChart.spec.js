/**
 * @fileoverview Test for BubbleChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import BarChart from '../../src/js/charts/barChart';

describe('Test for BarChart', () => {
  let barInstance;

  describe('constructor()', () => {
    beforeEach(() => {
      spyOn(BarChart.prototype, '_createComponentManager').and.returnValue({
        register: jasmine.createSpy('register'),
        presetAnimationConfig: jasmine.createSpy('presetAnimationConfig')
      });

      BarChart.prototype.options = {
        chartType: 'bar'
      };
    });

    it('The hasRightYAxis property must always be set, regardless of the option.', () => {
      barInstance = new BarChart(
        {
          categories: ['cate1', 'cate2', 'cate3'],
          series: {
            chartType: []
          }
        },
        {
          title: {
            fontSize: 14
          }
        },
        {
          chartType: 'bar',
          yAxis: {
            title: 'Temperature (Celsius)'
          }
        }
      );

      expect(barInstance.hasRightYAxis).toEqual(jasmine.any(Boolean));
    });

    it('When the second yAxis option is present, the rightYaxis component must be registered.', () => {
      barInstance = new BarChart(
        {
          categories: ['cate1', 'cate2', 'cate3'],
          series: {
            chartType: []
          }
        },
        {
          title: {
            fontSize: 14
          }
        },
        {
          chartType: 'bar',
          yAxis: [
            {
              title: 'Temperature (Celsius)'
            },
            {
              title: 'Age Group2'
            }
          ]
        }
      );

      const allCallForRegistComponent = barInstance.componentManager.register.calls.allArgs();

      expect(allCallForRegistComponent.some(callArgs => callArgs[0] === 'rightYAxis')).toBe(true);
    });
  });
});
