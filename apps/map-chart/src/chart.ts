import Store from './store/store';
import * as outlineBrush from './brushes/geoFeature';
import { debounce, EventEmitter } from '@toast-ui/shared';
import { ChartProps } from '@t/store';
import Painter from '@src/painter';
import GeoFeature from '@src/component/geoFeature';
import ComponentManager from '@src/component/componentManager';

import root from '@src/store/root';
import theme from '@src/store/theme';
import series from '@src/store/series';

export default class MapChart {
  store!: Store;

  readonly componentManager: ComponentManager;

  readonly containerEl: HTMLElement;

  el: HTMLDivElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  constructor(props: ChartProps) {
    const { el, options } = props;

    this.containerEl = el;
    this.el = this.createChartWrapper();
    this.containerEl.appendChild(this.el);
    this.store = new Store({ options });
    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
    });
    this.eventBus.on(
      'needDraw',
      debounce(() => this.draw(), 10)
    );
    this.initialize();
    this.store.observe(() => this.painter.setup());

    // @TODO need to be called from animator
    this.draw();
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
    [root, theme, series].forEach((module) => this.store.setModule(module));
  }

  protected initialize() {
    this.initStore();
    this.store.dispatch('initChartSize', this.containerEl);
    this.componentManager.add(GeoFeature);
    this.painter.addGroups([outlineBrush]);
  }
}
