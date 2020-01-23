/**
 * @fileoverview ComponentManager manages components of chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import dom from '../helpers/domHandler';
import Axis from '../components/axes/axis';
import Plot from '../components/plots/plot';
import title from '../components/title/title';
import RadialPlot from '../components/plots/radialPlot';
import ChartExportMenu from '../components/chartExportMenu/chartExportMenu';
import DrawingToolPicker from '../helpers/drawingToolPicker';

// legends
import Legend from '../components/legends/legend';
import SpectrumLegend from '../components/legends/spectrumLegend';
import CircleLegend from '../components/legends/circleLegend';

// tooltips
import Tooltip from '../components/tooltips/tooltip';
import GroupTooltip from '../components/tooltips/groupTooltip';
import MapChartTooltip from '../components/tooltips/mapChartTooltip';

// mouse event detectors
import MapChartEventDetector from '../components/mouseEventDetectors/mapChartEventDetector';
import mouseEventDetector from '../components/mouseEventDetectors/mouseEventDetector';

// series
import BarSeries from '../components/series/barChartSeries';
import ColumnSeries from '../components/series/columnChartSeries';
import LineSeries from '../components/series/lineChartSeries';
import RadialSeries from '../components/series/radialSeries';
import AreaSeries from '../components/series/areaChartSeries';
import BubbleSeries from '../components/series/bubbleChartSeries';
import ScatterSeries from '../components/series/scatterChartSeries';
import MapSeries from '../components/series/mapChartSeries';
import PieSeries from '../components/series/pieChartSeries';
import HeatmapSeries from '../components/series/heatmapChartSeries';
import TreemapSeries from '../components/series/treemapChartSeries';
import BoxplotSeries from '../components/series/boxPlotChartSeries';
import BulletSeries from '../components/series/bulletChartSeries';
import Zoom from '../components/series/zoom';
import snippet from 'tui-code-snippet';
import raphaelRenderUtil from '../plugins/raphaelRenderUtil';

const COMPONENT_FACTORY_MAP = {
  axis: Axis,
  plot: Plot,
  radialPlot: RadialPlot,
  legend: Legend,
  spectrumLegend: SpectrumLegend,
  circleLegend: CircleLegend,
  tooltip: Tooltip,
  groupTooltip: GroupTooltip,
  mapChartTooltip: MapChartTooltip,
  mapChartEventDetector: MapChartEventDetector,
  mouseEventDetector,
  barSeries: BarSeries,
  columnSeries: ColumnSeries,
  lineSeries: LineSeries,
  radialSeries: RadialSeries,
  areaSeries: AreaSeries,
  bubbleSeries: BubbleSeries,
  scatterSeries: ScatterSeries,
  mapSeries: MapSeries,
  pieSeries: PieSeries,
  heatmapSeries: HeatmapSeries,
  treemapSeries: TreemapSeries,
  boxplotSeries: BoxplotSeries,
  bulletSeries: BulletSeries,
  zoom: Zoom,
  chartExportMenu: ChartExportMenu,
  title
};

class ComponentManager {
  /**
   * ComponentManager manages components of chart.
   * @param {object} params parameters
   *      @param {object} params.theme - theme
   *      @param {object} params.options - options
   *      @param {DataProcessor} params.dataProcessor - data processor
   *      @param {boolean} params.hasAxes - whether has axes or not
   * @constructs ComponentManager
   * @private
   */
  constructor(params) {
    const chartOption = params.options.chart;
    const width = snippet.pick(chartOption, 'width') || chartConst.CHART_DEFAULT_WIDTH;
    const height = snippet.pick(chartOption, 'height') || chartConst.CHART_DEFAULT_HEIGHT;

    /**
     * Components
     * @type {Array.<object>}
     */
    this.components = [];

    /**
     * componentFactory map.
     * @type {object}
     */
    this.componentMap = {};

    /**
     * theme
     * @type {object}
     */
    this.theme = params.theme || {};

    /**
     * options
     * @type {object}
     */
    this.options = params.options || {};

    /**
     * data processor
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * whether chart has axes or not
     * @type {boolean}
     */
    this.hasAxes = params.hasAxes;

    /**
     * whether chart is vertical or not
     * @type {boolean}
     */
    this.isVertical = params.isVertical;

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * Drawing tool picker
     * @type {object}
     */
    this.drawingToolPicker = new DrawingToolPicker();

    this.drawingToolPicker.initDimension({
      width,
      height
    });

    /**
     * seriesTypes of chart
     * @type {Array.<string>}
     */
    this.seriesTypes = params.seriesTypes;
  }

  /**
   * Make component options.
   * @param {object} options options
   * @param {string} optionKey component option key
   * @param {string} componentName component name
   * @param {number} index component index
   * @returns {object} options
   * @private
   */
  _makeComponentOptions(options, optionKey, componentName, index) {
    options = options || this.options[optionKey];
    options = snippet.isArray(options) ? options[index] : options || {};

    return options;
  }

  /**
   * Register component.
   * The component refers to a component of the chart.
   * The component types are axis, legend, plot, series and mouseEventDetector.
   * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
   * @param {string} name component name
   * @param {string} classType component factory name
   * @param {object} [params={}] optional params that for alternative charts
   * @ignore
   */
  register(name, classType, params = {}) {
    const index = params.index || 0;
    const componentFactory = COMPONENT_FACTORY_MAP[classType];
    const { componentType } = componentFactory;

    params.name = name;
    params.chartTheme = this.theme;
    params.chartOptions = this.options;
    params.seriesTypes = this.seriesTypes;

    const optionKey = this._getOptionKey(componentType, name);

    params.theme = this._makeTheme(optionKey, name);
    params.options = this._makeOptions(optionKey, name, index);

    params.dataProcessor = this.dataProcessor;
    params.hasAxes = this.hasAxes;
    params.isVertical = this.isVertical;
    params.eventBus = this.eventBus;

    // alternative scale models for charts that do not use common scale models like maps
    params.alternativeModel = this.alternativeModel;

    const component = componentFactory(params);

    // component creation can be refused by factory, according to option data
    if (component) {
      component.componentName = name;
      component.componentType = componentType;

      this.components.push(component);
      this.componentMap[name] = component;
    }
  }

  /**
   * Preset before rerender
   * This method is eliminating zoom buttons and tooltips, so only works with zoom supported charts.
   */
  presetBeforeRerender() {
    if (this.componentMap.mouseEventDetector.zoomable) {
      this.componentMap.mouseEventDetector.presetBeforeRerender();
    }
  }

  /**
   * Preset components for setData
   * @param {object} theme theme object
   * @ignore
   */
  presetForChangeData(theme) {
    this.theme = theme;
    this.components.forEach(component => {
      if (component.presetForChangeData) {
        const { componentType, componentName } = component;
        const optionKey = this._getOptionKey(componentType, componentName);

        component.presetForChangeData(this._makeTheme(optionKey, componentName));
      }
    });
  }

  /**
   * apply animation config before setData
   * @param {boolean | object} animation whether animate or not, duration
   * @ignore
   */
  presetAnimationConfig(animation) {
    this.seriesTypes.forEach(seriesType => {
      if (snippet.isObject(this.options.series[seriesType])) {
        // For combo chart, options are set for each chart
        this.options.series[seriesType].animationDuration = this._getAnimationDuration(animation);
      } else {
        this.options.series.animationDuration = this._getAnimationDuration(animation);
      }
    });
  }

  /**
   * get default animation duration
   * @param {object | boolean} [animation] - animation options
   * @returns {number} duration - series rendering animation duration
   * @private
   */
  _getAnimationDuration(animation) {
    if (snippet.isBoolean(animation) && !animation) {
      return 0;
    }

    if (snippet.isObject(animation) && snippet.isNumber(animation.duration)) {
      return animation.duration;
    }

    return raphaelRenderUtil.getDefaultAnimationDuration(this.options.chartType);
  }

  /**
   * Make option
   * @param {string} optionKey Key on which to create the option.
   * @param {string} name name of component
   * @param {number} index index of chart for series option
   * @returns {object} option
   * @private
   */
  _makeOptions(optionKey, name, index) {
    let options = this.options[optionKey];

    if (!options && optionKey === 'rightYAxis') {
      options = this.options.yAxis;
    }

    if (optionKey === 'series') {
      this.seriesTypes.forEach(seriesType => {
        if (name.indexOf(seriesType) === 0) {
          options = options[seriesType] || options; // For combo chart, options are set for each chart

          if (snippet.isArray(options)) {
            options = options[index] || {};
          }

          return false;
        }

        return true;
      });
    }

    return options;
  }

  /**
   * Make option key
   * @param {string} type type of component
   * @param {name} name name of component
   * @returns {string} optionKey Key on which to create the option.
   * @private
   */
  _getOptionKey(type, name) {
    return type === 'axis' ? name : type;
  }

  /**
   * Make theme
   * @param {string} optionKey Key on which to create the option.
   * @param {string} name name of component
   * @returns {object} theme
   * @private
   */
  _makeTheme(optionKey, name) {
    let theme = this.theme[optionKey];

    if (!theme && optionKey === 'rightYAxis') {
      theme = this.theme.yAxis;
    }

    if (optionKey === 'series') {
      this.seriesTypes.forEach(seriesType => {
        if (name.indexOf(seriesType) === 0) {
          theme = theme[seriesType]; // For combo, single chart, themes are set for each chart

          return false;
        }

        return true;
      });
    }

    return theme;
  }

  /**
   * Make data for rendering.
   * @param {string} name - component name
   * @param {string} type - component type
   * @param {object} paper - raphael object
   * @param {{
   *      layoutBounds: {
   *          dimensionMap: object,
   *          positionMap: object
   *      },
   *      limitMap: object,
   *      axisDataMap: object,
   *      maxRadius: ?number
   * }} boundsAndScale - bounds and scale data
   * @param {?object} additionalData - additional data
   * @returns {object}
   * @private
   */
  _makeDataForRendering(name, type, paper, boundsAndScale, additionalData) {
    const data = Object.assign({ paper }, additionalData);

    if (boundsAndScale) {
      Object.assign(data, boundsAndScale);

      data.layout = {
        dimension: data.dimensionMap[name] || data.dimensionMap[type],
        position: data.positionMap[name] || data.positionMap[type]
      };
    }

    return data;
  }

  /**
   * Render components.
   * @param {string} funcName - function name for executing
   * @param {{
   *      layoutBounds: {
   *          dimensionMap: object,
   *          positionMap: object
   *      },
   *      limitMap: object,
   *      axisDataMap: object,
   *      maxRadius: ?number
   * }} boundsAndScale - bounds and scale data
   * @param {?object} additionalData - additional data
   * @param {?HTMLElement} container - container
   */
  render(funcName, boundsAndScale, additionalData, container) {
    const elements = this.components.map(component => {
      let element = null;

      if (component[funcName]) {
        const name = component.componentName;
        const type = component.componentType;
        const paper = this.drawingToolPicker.getPaper(container, component.drawingType);
        const data = this._makeDataForRendering(name, type, paper, boundsAndScale, additionalData);

        const result = component[funcName](data);

        if (result && !result.paper) {
          element = result;
        }
      }

      return element;
    });

    if (container) {
      dom.append(container, elements);
    }
  }

  /**
   * Find components to conditionMap.
   * @param {object} conditionMap condition map
   * @returns {Array.<object>} filtered components
   */
  where(conditionMap) {
    return this.components.filter(component => {
      let contained = true;

      Object.entries(conditionMap).forEach(([key, value]) => {
        if (component[key] !== value) {
          contained = false;
        }

        return contained;
      });

      return contained;
    });
  }

  /**
   * Execute components.
   * @param {string} funcName - function name
   */
  execute(funcName, ...args) {
    this.components.forEach(component => {
      if (component[funcName]) {
        component[funcName](...args);
      }
    });
  }

  /**
   * Get component.
   * @param {string} name component name
   * @returns {object} component instance
   */
  get(name) {
    return this.componentMap[name];
  }

  /**
   * Whether has component or not.
   * @param {string} name - comopnent name
   * @returns {boolean}
   */
  has(name) {
    return !!this.get(name);
  }
}

export default ComponentManager;
