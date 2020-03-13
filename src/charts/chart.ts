import Store, { ChartState } from '@src/store/store';

import layout from '@src/layout';
import dataRange from '@src/dataRange';

import EventEmitter from '@src/eventEmitter';
import ComponentManager from '@src/component/componentManager';
import Painter from '@src/painter';

import animator from '@src/animator';

import { debounce } from '@src/helpers/utils';

export type ChartSetting = {
  el: HTMLElement;
  chart?: ChartState['chart'];
  data: Record<string, any>;
  options: Record<string, any>;
};

// 추후 별도 모듈로 분리
const responderDetectors: {
  [key: string]: Function;
} = {
  circle: (mousePosition: any, { x, y, radius }: any, componentRect: any) => {
    const radiusAdjustment = 10;

    return (
      Math.pow(mousePosition.x - (x + componentRect.x), 2) +
        Math.pow(mousePosition.y - (y + componentRect.y), 2) <
      Math.pow(radius + radiusAdjustment, 2)
    );
  },
  rect: (mousePosition: any, { x, y, width, height }: any) => {
    return (
      mousePosition.x >= x &&
      mousePosition.x <= x + width &&
      mousePosition.y >= y &&
      mousePosition.y <= y + height
    );
  }
};

export default class Chart {
  store: Store;

  ___animId___ = null;

  readonly el: HTMLElement;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  readonly componentManager: ComponentManager;

  constructor(settings: ChartSetting) {
    const { el } = settings;
    this.el = el;

    this.store = new Store({
      state: {
        chart: settings.options.chart,
        data: settings.data,
        options: settings.options
      }
    });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus
    });

    this.store.observe(() => {
      this.painter.setup();
    });

    this.eventBus.on(
      'needLoop',
      debounce(() => {
        this.eventBus.emit('loopStart');

        animator.add({
          onCompleted: () => {
            this.eventBus.emit('loopComplete');
          },
          chart: this,
          duration: 1000,
          requestor: this
        });
      }, 10)
    );

    this.eventBus.on('needSubLoop', options => {
      animator.add({ ...options, chart: this });
    });

    this.eventBus.on(
      'needDraw',
      debounce(() => {
        this.draw();
      }, 10)
    );

    this.initialize();
  }

  handleEvent(event: MouseEvent) {
    const delegationMethod = `on${event.type[0].toUpperCase() + event.type.substring(1)}`;

    const { clientX, clientY } = event;

    const canvasRect = this.painter.ctx.canvas.getBoundingClientRect();

    const mousePosition = {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top
    };

    this.componentManager.forEach(component => {
      if (!(component as any)[delegationMethod]) {
        return;
      }

      if (!responderDetectors.rect(mousePosition, component.rect)) {
        return;
      }

      const detected = (component.responders || []).filter((m: any) => {
        return responderDetectors[m.type](mousePosition, m, component.rect);
      });

      (component as any)[delegationMethod]({ mousePosition, responders: detected }, event);
    });
  }

  initialize() {
    this.store.setModule(layout);
    this.store.setModule(dataRange);
  }

  draw() {
    this.painter.beforeFrame();

    this.componentManager.forEach(component => {
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
}
