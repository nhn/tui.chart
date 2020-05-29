import Store from '@src/store/store';
import layout from '@src/store/layout';
import seriesData from '@src/store/seriesData';
import EventEmitter from '@src/eventEmitter';
import ComponentManager from '@src/component/componentManager';
import Painter from '@src/painter';
import animator from '@src/animator';
import { debounce } from '@src/helpers/utils';
import { ChartProps } from '@t/options';
import { responderDetectors } from '@src/responderDetectors';
import { Options } from '@t/store/store';

export default class Chart<T extends Options> {
  store: Store<T>;

  ___animId___ = null;

  readonly el: Element;

  ctx!: CanvasRenderingContext2D;

  painter = new Painter(this);

  readonly eventBus: EventEmitter = new EventEmitter();

  readonly componentManager: ComponentManager<T>;

  constructor(props: ChartProps<T>) {
    const { el, options, series, categories } = props;

    this.el = el;

    this.store = new Store({
      chart: options.chart,
      series,
      categories,
      options,
    });

    this.componentManager = new ComponentManager({
      store: this.store,
      eventBus: this.eventBus,
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
          requester: this,
        });
      }, 10)
    );

    this.eventBus.on('needSubLoop', (opts) => {
      animator.add({ ...opts, chart: this });
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
      y: clientY - canvasRect.top,
    };

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

      component[delegationMethod]({ mousePosition, responders: detected }, event);
    });
  }

  initialize() {
    this.store.setModule(layout);
    this.store.setModule(seriesData);
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
}
