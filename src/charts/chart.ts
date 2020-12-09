import Store from '@src/store/store';
import root from '@src/store/root';
import layout from '@src/store/layout';
import seriesData from '@src/store/seriesData';
import category from '@src/store/category';
import legend from '@src/store/legend';
import optionsStore from '@src/store/options';
import theme from '@src/store/theme';
import EventEmitter, { CustomEventType, EventListener } from '@src/eventEmitter';
import ComponentManager from '@src/component/componentManager';
import Painter from '@src/painter';
import Animator from '@src/animator';
import { debounce, isBoolean, isNumber, isUndefined, pick, isAutoValue } from '@src/helpers/utils';
import {
  ChartProps,
  Point,
  AnimationOptions,
  SeriesDataInput,
  Size,
  DataInput,
  ChartSizeInput,
} from '@t/options';

import { responderDetectors } from '@src/responderDetectors';
import { ChartState, Options, StoreModule, UsingContainerSize } from '@t/store/store';
import Component from '@src/component/component';
import { RespondersModel } from '@t/components/series';
import { CheckedLegendType } from '@t/components/legend';
import { message } from '@src/message';

export const DEFAULT_ANIM_DURATION = 500;

export type AddSeriesDataInfo = { chartType?: string; category?: string };
export type SelectSeriesInfo = {
  seriesIndex?: number;
  index?: number;
  alias?: string;
  chartType?: 'line' | 'area' | 'column' | 'scatter';
};

export interface SelectSeriesHandlerParams<T extends Options> extends SelectSeriesInfo {
  state: ChartState<T>;
}

function getUsingContainerSize(
  eventName: 'initOptions' | 'updateOptions',
  usingContainerSize: UsingContainerSize,
  width?: ChartSizeInput,
  height?: ChartSizeInput
) {
  const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;
  const isAutoWidth = isAutoValue(width);
  const isAutoHeight = isAutoValue(height);

  return eventName === 'updateOptions'
    ? {
        width:
          !isUndefined(width) && usingContainerWidth !== isAutoWidth
            ? isAutoWidth
            : usingContainerWidth,
        height:
          !isUndefined(height) && usingContainerHeight !== isAutoHeight
            ? isAutoHeight
            : usingContainerHeight,
      }
    : {
        width: isAutoWidth,
        height: isAutoHeight,
      };
}

export default abstract class Chart<T extends Options> {
  store: Store<T>;

  ___animId___ = null;

  animator: Animator;

  readonly el: HTMLElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  readonly componentManager: ComponentManager<T>;

  modules?: StoreModule[];

  enteredComponents: Component[] = [];

  animationControlFlag = {
    resizing: false,
    updating: false,
  };

  private getAnimationDuration(animationOption?: AnimationOptions) {
    const { firstRendering } = this.animator;
    const { resizing, updating } = this.animationControlFlag;
    let duration;

    if ((!firstRendering && !resizing) || isUndefined(animationOption)) {
      duration = DEFAULT_ANIM_DURATION;
    } else if (isBoolean(animationOption)) {
      duration = animationOption ? DEFAULT_ANIM_DURATION : 0;
    } else if (isNumber(animationOption.duration)) {
      duration = animationOption.duration;
    }

    if (updating) {
      duration = 0;
    }

    this.animationControlFlag.updating = false;

    return duration;
  }

  constructor(props: ChartProps<T>) {
    const { el, options, series, categories } = props;

    this.el = el;

    this.animator = new Animator();

    this.store = new Store({
      series,
      categories,
      options,
    });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
    });

    this.eventBus.on(
      'needLoop',
      debounce(() => {
        let duration = this.getAnimationDuration(options.chart?.animation);

        if (this.animationControlFlag.resizing) {
          duration = isUndefined(options.responsive)
            ? this.getAnimationDuration()
            : this.getAnimationDuration(options.responsive?.animation);

          this.animationControlFlag.resizing = false;
        }

        this.eventBus.emit('loopStart');

        this.animator.add({
          onCompleted: () => {
            this.eventBus.emit('loopComplete');
          },
          chart: this,
          duration,
          requester: this,
        });
      }, 10)
    );

    this.eventBus.on('needSubLoop', (opts) => {
      this.animator.add({ ...opts, chart: this });
    });

    this.eventBus.on(
      'needDraw',
      debounce(() => {
        this.draw();
      }, 10)
    );

    // for using class field "modules"
    setTimeout(() => {
      this.initialize();

      this.store.observe(() => {
        this.painter.setup();
      });

      if (isAutoValue(options?.chart?.width) || isAutoValue(options?.chart?.height)) {
        this.setResizeEvent();
      }
    }, 0);
  }

  resizeChartSize() {
    this.animationControlFlag.resizing = true;
    const { offsetWidth, offsetHeight } = this.el;
    const {
      usingContainerSize: { width: usingContainerWidth, height: usingContainerHeight },
      chart: { width, height },
    } = this.store.state;

    if (
      (!usingContainerWidth && !usingContainerHeight) ||
      (!offsetWidth && !offsetHeight) ||
      (offsetWidth === width && offsetHeight === height)
    ) {
      this.animationControlFlag.resizing = false;

      return;
    }

    this.eventBus.emit('resetHoveredSeries');

    this.store.dispatch('setChartSize', {
      width: usingContainerWidth ? offsetWidth : width,
      height: usingContainerHeight ? offsetHeight : height,
    });

    this.draw();
  }

  private debounceResizeEvent = debounce(() => {
    this.resizeChartSize();
  }, 100);

  setResizeEvent() {
    window.addEventListener('resize', this.debounceResizeEvent);
  }

  clearResizeEvent() {
    window.removeEventListener('resize', this.debounceResizeEvent);
  }

  handleEvent(event: MouseEvent) {
    const { clientX, clientY, type: eventType } = event;

    const delegationMethod = `on${eventType[0].toUpperCase() + eventType.substring(1)}`;

    const canvasRect = this.painter.ctx.canvas.getBoundingClientRect();

    const mousePosition = {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top,
    };

    const newEnteredComponents: Component[] = [];

    if (eventType === 'mousemove') {
      this.componentManager.forEach((component) => {
        const { x, y, height, width } = component.rect;
        const exist = this.enteredComponents.some(
          (enteredComponent) => enteredComponent === component
        );
        const entered =
          mousePosition.x >= x &&
          mousePosition.x <= x + width &&
          mousePosition.y >= y &&
          mousePosition.y <= y + height;

        if (entered) {
          newEnteredComponents.push(component);

          if (!exist && component.onMouseenterComponent) {
            component.onMouseenterComponent();
          }
        } else if (exist && component.onMouseoutComponent) {
          component.onMouseoutComponent();
        }
      });

      this.enteredComponents = newEnteredComponents;
    }

    const allResponders: RespondersModel = [];
    this.componentManager.forEach((component) => {
      if (!component[delegationMethod]) {
        return;
      }

      if (!responderDetectors.rect(mousePosition, component.rect)) {
        return;
      }

      const detected = (component.responders || []).filter((m) => {
        return responderDetectors[m.type](mousePosition, m, component.rect);
      });

      if (detected.length) {
        allResponders.push({ component, detected });
      }

      component[delegationMethod]({ mousePosition, responders: detected }, event);
    });

    if (this.handleEventForAllResponders) {
      this.handleEventForAllResponders(event, allResponders, delegationMethod, mousePosition);
    }
  }

  protected initStore(defaultModules: StoreModule[]) {
    [...defaultModules, ...(this.modules ?? [])].forEach((module) => this.store.setModule(module));
  }

  protected initialize() {
    this.initStore([root, optionsStore, theme, seriesData, legend, layout, category]);

    this.store.dispatch('initChartSize', this.el);
  }

  draw() {
    this.painter.beforeFrame();

    this.componentManager.forEach((component) => {
      if (!component.isShow) {
        return;
      }

      this.painter.beforeDraw(component.rect.x, component.rect.y);
      if (component.beforeDraw) {
        component.beforeDraw(this.painter);
      }

      component.draw(this.painter);
      this.painter.afterDraw();
    });
  }

  update(delta: number) {
    this.componentManager.invoke('update', delta);
  }

  initUpdate(delta: number) {
    this.componentManager.invoke('initUpdate', delta);
  }

  handleEventForAllResponders?(
    event: MouseEvent,
    responderModels: RespondersModel,
    delegationMethod: string,
    mousePosition: Point
  ): void;

  /**
   * Get checked legend chart type and label, checked state.
   * @returns {[{checked: boolean, chartType: ChartType, label: string}]} array data that whether series has checked
   * @api
   */
  public getCheckedLegend = (): CheckedLegendType => {
    const { data } = this.store.state.legend;

    return data
      .filter((datum) => datum.checked)
      .map((datum) => pick(datum, 'chartType', 'label', 'checked'));
  };

  public abstract updateOptions(options: Options): void;

  public abstract setOptions(options: Options): void;

  public getOptions = () => {
    return JSON.parse(JSON.stringify(this.store.initStoreState.options));
  };

  public abstract addSeries(data: SeriesDataInput, dataInfo?: AddSeriesDataInfo): void;

  /**
   * Register of user event.
   * @param {string} eventName event name
   * @param {function} func event callback
   * @api
   */
  public on = (eventName: CustomEventType, handler: EventListener) => {
    /**
     * Register Events that occur when click legend label
     * @event ChartBase#clickLegendLabel
     * @param {object} info selected legend info
     * @api
     * @example
     * chart.on('clickLegendLabel', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when click legend checkbox
     * @event ChartBase#clickLegendCheckbox
     * @param {object} info selected legend info
     * @api
     * @example
     * chart.on('clickLegendCheckbox', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when select series
     * @event ChartBase#selectSeries
     * @param {object} info selected series info
     * @api
     * @example
     * chart.on('selectSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when unselect series
     * @event ChartBase#unselectSeries
     * @param {object} info unselected series info
     * @api
     * @example
     * chart.on('unselectSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when hover to series
     * @event ChartBase#hoverSeries
     * @param {object} info hovered series info
     * @api
     * @example
     * chart.on('hoverSeries', (info) => {
     *   console.log(info);
     * });
     */

    /**
     * Register Events that occur when unhover from series
     * @event ChartBase#unhoverSeries
     * @param {object} info unhovered series info
     * @api
     * @example
     * chart.on('unhoverSeries', (info) => {
     *  console.log(info);
     * });
     */

    /**
     * Register Events that occur when zooming
     * @event ChartBase#zoom
     * @param {string[]} dataRange - []
     * @api
     * @example
     * chart.on('zoom', (dataRange) => {
     *    console.log(dataRange);
     * });
     */

    /**
     * Register Events that occur when zoom is reset
     * @event ChartBase#resetZoom
     * @api
     * @example
     * chart.on('resetZoom', () => {});
     */
    this.eventBus.on(eventName, handler);
  };

  public abstract setData(data: DataInput): void;

  /**
   * Destroys the instance.
   * @api
   * @example
   * chart.destroy();
   */
  public destroy = () => {
    this.componentManager.clear();
    this.clearResizeEvent();
    this.el.innerHTML = '';

    Object.keys(this).forEach((key) => {
      this[key] = null;
    });
  };

  private isSelectableSeries() {
    return this.store.initStoreState.options.series?.selectable;
  }

  public selectSeries = (seriesInfo: SelectSeriesInfo) => {
    if (!this.isSelectableSeries()) {
      throw new Error(message.SELECT_SERIES_API_SELECTABLE_ERROR);
    }

    this.eventBus.emit('selectSeries', { ...seriesInfo, state: this.store.state });
  };

  public unselectSeries = () => {
    if (!this.isSelectableSeries()) {
      throw new Error(message.SELECT_SERIES_API_SELECTABLE_ERROR);
    }

    this.store.dispatch('setAllLegendActiveState', true);
    this.eventBus.emit('resetSelectedSeries');
  };

  /**
   * Public API for resizable.
   * @param {object} size chart size
   *      @param {number} [size.width] width
   *      @param {number} [size.height] height
   * @api
   */
  public resize = (size: Partial<Size>) => {
    this.store.dispatch('updateOptions', { chart: { ...size } });
  };

  public setTooltipOffset(offset: Partial<Point>) {
    const { x: offsetX, y: offsetY } = offset;

    this.store.dispatch('updateOptions', { tooltip: { offsetX, offsetY } });
  }

  private setResizeEventListeners = (
    eventName: 'initOptions' | 'updateOptions',
    options: Options
  ) => {
    const { usingContainerSize } = this.store.state;
    const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;
    const width = options?.chart?.width;
    const height = options?.chart?.height;
    const isAutoWidth = isAutoValue(width);
    const isAutoHeight = isAutoValue(height);

    if ((usingContainerWidth || usingContainerHeight) && isNumber(width) && isNumber(height)) {
      this.clearResizeEvent();
    } else if (!(usingContainerWidth || usingContainerHeight) && (isAutoWidth || isAutoHeight)) {
      this.setResizeEvent();
    }

    this.store.dispatch(
      'setUsingContainerSize',
      getUsingContainerSize(eventName, usingContainerSize, width, height)
    );
  };

  protected dispatchOptionsEvent(eventName: 'initOptions' | 'updateOptions', options: Options) {
    this.setResizeEventListeners(eventName, options);

    const { offsetWidth, offsetHeight } = this.el;

    this.store.dispatch(eventName, {
      options,
      containerSize: { width: offsetWidth, height: offsetHeight },
    });
  }
}
