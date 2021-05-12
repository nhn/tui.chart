import Store from './store/store';
import { utils, EventEmitter } from '@toast-ui/shared';
import { ChartProps, StoreModule } from '@t/store/store';
import Painter from '@src/painter';
import Outline from '@src/component/outline';
import ComponentManager from '@src/component/componentManager';
import world from '../data/world.json';
import { feature } from 'topojson-client';
import root from '@src/store/root';

// import Animator from "@toast-ui/chart/src/animator";

const { debounce } = utils;

// projection은 이레벨
// geoPath를 이 레벨에 갖고 있어야 할듯? 아니면 브러시?

export default class MapChart {
  store!: Store;

  readonly componentManager: ComponentManager;

  modules: StoreModule[];

  readonly containerEl: HTMLElement;

  el: HTMLDivElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  constructor(props: ChartProps) {
    const { el, options, modules } = props;
    this.modules = modules ?? [];

    const data = feature(world, world.objects.countries).features;
    // console.log(data);

    // @todo ga

    this.containerEl = el;
    this.el = this.createChartWrapper();
    this.containerEl.appendChild(this.el);

    this.store = new Store({
      series: data,
      options,
    });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
    });

    this.eventBus.on(
      'needDraw',
      debounce(() => {
        this.draw();
      }, 10)
    );

    this.initialize();
    this.store.observe(() => {
      this.painter.setup();
    });
    this.componentManager.add(Outline);
  }

  createChartWrapper() {
    const el = document.createElement('div');
    el.classList.add('toastui-map-chart-wrapper');

    return el;
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

  protected initStore() {
    [root, ...this.modules].forEach((module) => this.store.setModule(module));
  }

  protected initialize() {
    this.initStore();
    this.store.dispatch('initChartSize', this.containerEl);
  }
}
