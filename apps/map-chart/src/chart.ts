import Store from './store/store';
import { debounce, EventEmitter } from '@toast-ui/shared';
import { ChartProps } from '@t/store';
import Painter from '@src/painter';
import ComponentManager from '@src/component/componentManager';
import { responderDetectors } from '@src/responderDetectors';

import * as outlineBrush from '@src/brushes/geoFeature';
import * as rectBrush from '@src/brushes/rect';

import Outline from '@src/component/outline';
import Series from '@src/component/series';
import HoveredSeries from '@src/component/hoveredSeries';
import Legend from '@src/component/legend';
import Title from '@src/component/title';
import ZoomButton from '@src/component/zoomButton';
import Tooltip from '@src/component/tooltip';

import root from '@src/store/root';
import theme from '@src/store/theme';
import series from '@src/store/series';
import layout from '@src/store/layout';
import legend from '@src/store/legend';
import scale from '@src/store/scale';

export default class MapChart {
  store!: Store;

  readonly componentManager: ComponentManager;

  readonly containerEl: HTMLElement;

  el: HTMLDivElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  constructor(props: ChartProps) {
    const { el, options, data } = props;

    this.containerEl = el;
    this.el = this.createChartWrapper();
    this.containerEl.appendChild(this.el);
    this.store = new Store({ options, data });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
    });
    this.eventBus.on(
      'needDraw',
      debounce(() => this.draw(), 10)
    );
    this.initialize();

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
      component.beforeDraw?.(this.painter);

      component.draw(this.painter);
      this.painter.afterDraw();
    });
  }

  handleEvent(event: MouseEvent) {
    const { clientX, clientY, type: eventType } = event;

    const delegationMethod = `on${eventType[0].toUpperCase() + eventType.substring(1)}`;

    const canvas = this.painter.ctx.canvas;
    const canvasRect = canvas.getBoundingClientRect();
    // Calculate scale for chart affected by a CSS transform.
    const scaleX = canvasRect.width / canvas.offsetWidth;
    const scaleY = canvasRect.height / canvas.offsetHeight;

    const mousePosition = {
      x: (clientX - canvasRect.left) / scaleX,
      y: (clientY - canvasRect.top) / scaleY,
    };

    const projection = this.painter.projection;

    this.componentManager.forEach((component) => {
      if (!component[delegationMethod]) {
        return;
      }

      if (!responderDetectors.rect({ mousePosition, model: component.rect })) {
        return;
      }

      const detected = (component.responders || []).filter((model) => {
        return responderDetectors[model.responderType]({
          mousePosition,
          model,
          componentRect: component.rect,
          projection,
        });
      });

      component[delegationMethod]({ mousePosition, responders: detected, projection }, event);
    });
  }

  protected initStore() {
    [root, theme, legend, scale, series, layout].forEach((module) => this.store.setModule(module));
  }

  protected initialize() {
    this.initStore();
    this.store.dispatch('initChartSize', this.containerEl);

    this.store.observe(() => this.painter.setup());
    this.store.dispatch('updateSeriesCentroid', { painter: this.painter });

    [Title, ZoomButton, Outline, Series, HoveredSeries, Legend, Tooltip].forEach((component) => {
      this.componentManager.add(component, { chartEl: this.el });
    });

    this.painter.addGroups([outlineBrush, rectBrush]);
  }
}
