import Store from '@src/store/store';
import root from '@src/store/root';
import layout from '@src/store/layout';
import seriesData from '@src/store/seriesData';
import category from '@src/store/category';
import legend from '@src/store/legend';
import optionsStore, { useResponsive } from '@src/store/options';
import theme from '@src/store/theme';
import EventEmitter from '@src/eventEmitter';
import ComponentManager from '@src/component/componentManager';
import Painter from '@src/painter';
import Animator from '@src/animator';
import { debounce, isBoolean, isNumber, isUndefined, pick, throttle } from '@src/helpers/utils';
import { ChartProps, Point, AnimationOptions } from '@t/options';
import { responderDetectors } from '@src/responderDetectors';
import { Options, StoreModule } from '@t/store/store';
import Component from '@src/component/component';
import { RespondersModel } from '@t/components/series';
import { CheckedLegendType } from '@t/components/legend';

export const DEFAULT_ANIM_DURATION = 500;

export default abstract class Chart<T extends Options> {
  store: Store<T>;

  ___animId___ = null;

  animator: Animator;

  readonly el: Element;

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

    this.animationControlFlag.resizing = false;
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
          duration = isBoolean(options.responsive)
            ? this.getAnimationDuration()
            : this.getAnimationDuration(options.responsive?.animation);
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

      if (useResponsive(options)) {
        this.setResizeEvent();
      }
    }, 0);
  }

  resize() {
    this.animationControlFlag.resizing = true;
    const { offsetWidth, offsetHeight } = this.el as HTMLElement;
    const { width, height } = this.store.state.chart;

    if ((!offsetWidth && !offsetHeight) || (offsetWidth === width && offsetHeight === height)) {
      this.animationControlFlag.resizing = false;

      return;
    }

    this.eventBus.emit('resetHoveredSeries');

    this.store.dispatch('setChartSize', { width: offsetWidth, height: offsetHeight });

    this.draw();
  }

  setResizeEvent() {
    window.addEventListener(
      'resize',
      throttle(() => {
        this.resize();
      }, 200)
    );
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
}
