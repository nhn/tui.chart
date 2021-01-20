import { FunctionPropertyNames } from '@t/store/store';

import Store from '../store/store';
import EventEmitter from '../eventEmitter';

import Component from '@src/component/component';
import { debounce } from '@src/helpers/utils';

type ComponentConstructor<T> = new ({
  store,
  eventBus,
}: {
  store: Store<T>;
  eventBus: EventEmitter;
}) => Component;

export default class ComponentManager<T> {
  components: Component[] = [];

  store: Store<T>;

  eventBus: EventEmitter;

  constructor({ store, eventBus }: { store: Store<T>; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  add(ComponentCtor: ComponentConstructor<T>, initialParam?: any) {
    const component = new ComponentCtor({
      store: this.store,
      eventBus: this.eventBus,
    });

    if (component.initialize) {
      component.initialize(initialParam);
    }

    let proc = (...args: any[]) => {
      component.render(args[0], args[1]); // rest쓰면 에러남
      component.sync();
      this.eventBus.emit('needLoop');
    };

    this.store.observe((...args) => {
      proc(...args);
    });

    proc = debounce(proc);

    this.components.push(component);
  }

  remove(ComponentCtor: ComponentConstructor<T>) {
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
