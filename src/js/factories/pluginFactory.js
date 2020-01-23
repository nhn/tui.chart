/**
 * @fileoverview  Plugin factory play role register rendering plugin.
 *                Also, you can get plugin from this factory.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import chartConst from '../const';

const plugins = {};
export default {
  /**
   * Get graph renderer.
   * @param {string} libType type of graph library
   * @param {string} chartType chart type
   * @returns {object} renderer instance
   */
  get(libType, chartType) {
    const plugin = plugins[libType || chartConst.DEFAULT_PLUGIN];

    if (!plugin) {
      throw new Error(`Not exist ${libType} plugin.`);
    }

    const Renderer = plugin[chartType];
    if (!Renderer) {
      throw new Error(`Not exist ${chartType} chart renderer.`);
    }

    const renderer = new Renderer();

    return renderer;
  },
  /**
   * Plugin register.
   * @param {string} libType type of graph library
   * @param {object} plugin plugin to control library
   */
  register(libType, plugin) {
    plugins[libType] = plugin;
  }
};
