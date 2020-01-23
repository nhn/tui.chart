/**
 * @fileoverview Test for pluginFactory.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import pluginFactory from '../../src/js/factories/pluginFactory.js';

describe('pluginFactory', () => {
  const BarChart = () => {};
  pluginFactory.register('testRaphael', {
    bar: BarChart
  });

  describe('get()', () => {
    it('should return plugin, if plugin is registered.', () => {
      const graphRenderer = pluginFactory.get('testRaphael', 'bar');

      expect(!!graphRenderer).toBeTruthy();
      expect(graphRenderer instanceof BarChart).toBeTruthy();
    });

    it('should throw errors, if plugin is not registered.', () => {
      expect(() => {
        pluginFactory.get('d3', 'bar');
      }).toThrowError('Not exist d3 plugin.');
    });

    it('should throw errors, if chart renderer is not registered.', () => {
      expect(() => {
        pluginFactory.get('testRaphael', 'line');
      }).toThrowError('Not exist line chart renderer.');
    });
  });
});
