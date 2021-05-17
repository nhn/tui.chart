import { FunctionPropertyNames } from '@t/store';
import Store from '@src/store/store';
import Component from '@src/component/component';
import { debounce, EventEmitter } from '@toast-ui/shared';

type ComponentConstructor = new ({
  store,
  eventBus,
}: {
  store: Store;
  eventBus: EventEmitter;
}) => Component;

export default class ComponentManager {
  components: Component[] = [];

  store: Store;

  eventBus: EventEmitter;

  constructor({ store, eventBus }: { store: Store; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  add(ComponentCtor: ComponentConstructor, initialParam?: any) {
    const component = new ComponentCtor({
      store: this.store,
      eventBus: this.eventBus,
    });

    if (component.initialize) {
      component.initialize(initialParam);
    }

    let proc = (...args: any[]) => {
      component.render(args[0], args[1]);
      // component.sync();
    };

    this.store.observe((...args) => {
      proc(...args);
    });

    proc = debounce(proc);

    this.components.push(component);
  }

  remove(ComponentCtor: ComponentConstructor) {
    this.components = this.components.filter((component) => !(component instanceof ComponentCtor));
  }

  clear() {
    this.components = [];
    this.eventBus.emit('needDraw');
  }

  invoke(method: FunctionPropertyNames<Component>, params: any) {
    this.components.forEach((component) => {
      const fn: Function = component[method!];
      if (fn) {
        fn.call(component, params);
      }
    });
  }

  forEach(iteratee: (component: Component, index: number) => void) {
    this.components.forEach(iteratee);
  }
}
