/**
 * @fileoverview Test for ComponentManager.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import ComponentManager from '../../src/js/charts/componentManager';
import snippet from 'tui-code-snippet';

describe('Test for ComponentManager', () => {
  let componentManager;

  beforeEach(() => {
    componentManager = new ComponentManager({
      options: {},
      dataProcessor: {
        seriesType: 'bar',
        getLegendLabels: () => {},
        getLegendData: () => {}
      }
    });
  });

  describe('register()', () => {
    it('should have plot, after register plot', () => {
      componentManager.options = {
        xAxis: {}
      };
      componentManager.register('plot', 'plot');

      const { plot } = componentManager.componentMap;
      expect(plot).toBeTruthy();
      expect(plot.componentType).toEqual('plot');
      expect(
        snippet.inArray('plot', snippet.pluck(componentManager.components, 'componentName'))
      ).toBe(0);
    });

    it('should not have plot component, before register plot', () => {
      expect(componentManager.componentMap.plot).toBeFalsy();
    });
  });

  describe('presetForChangeData()', () => {
    beforeEach(() => {
      spyOn(componentManager, '_makeTheme');
    });
    it('presetForChangeData of the objects registered in components should be executed.', () => {
      const reSetMethod = jasmine.createSpy('reSet');
      componentManager.components = [
        { presetForChangeData: reSetMethod },
        { presetForChangeData: reSetMethod },
        { presetForChangeData: reSetMethod }
      ];

      componentManager.presetForChangeData();

      expect(reSetMethod.calls.count()).toBe(3);
    });
  });

  describe('where()', () => {
    it("should filter components by parameter's key value", () => {
      componentManager.components.push({
        name: 'columnSeries',
        componentType: 'series'
      });
      componentManager.components.push({
        name: 'lineSeries',
        componentType: 'series'
      });
      componentManager.components.push({
        name: 'tooltip',
        componentType: 'tooltip'
      });

      const actual = componentManager.where({ componentType: 'series' });
      const expected = [
        {
          name: 'columnSeries',
          componentType: 'series'
        },
        {
          name: 'lineSeries',
          componentType: 'series'
        }
      ];

      expect(actual).toEqual(expected);
    });
  });
});
