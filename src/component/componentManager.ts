import { FunctionPropertyNames } from '@src/types';

import Store from '../store/store';
import EventEmitter from '../eventEmitter';

import Component from '@src/component/component';
import { debounce } from '@src/helpers/utils';

export default class ComponentManager {
  components: Component[] = [];

  store: Store;

  eventBus: EventEmitter;

  constructor({ store, eventBus }: { store: Store; eventBus: EventEmitter }) {
    this.store = store;
    this.eventBus = eventBus;
  }

  add(
    ComponentCtor: new ({ store, eventBus }: { store: Store; eventBus: EventEmitter }) => Component,
    initialParam?: any
  ) {
    const component = new ComponentCtor({
      store: this.store,
      eventBus: this.eventBus
    });

    if (component.initialize) {
      component.initialize(initialParam);
    }

    let proc = (...args: any[]) => {
      component.render(args[0], args[1]); // rest쓰면 에러남
      component.syncModels();
      this.eventBus.emit('needLoop');
    };

    this.store.observe((...args) => {
      proc(...args);
    });

    proc = debounce(proc);

    this.components.push(component);
  }

  clear() {
    this.components = [];
  }

  invoke(method: FunctionPropertyNames<Component>, params: any) {
    this.components.forEach(component => {
      const fn: Function = (component as any)[method];
      if (fn) {
        fn.call(component, params);
      }
    });
  }

  forEach(iteratee: (component: Component, index: number) => void) {
    this.components.forEach(iteratee);
  }

  // getComponentByName(name: string) {
  //   let result: Component | null = null;

  //   this.recursive(child => {
  //     if (child.name === name) {
  //       result = child;

  //       return false;
  //     }
  //   });

  //   return result;
  // }

  // getComponentByType(type: string) {
  //   let result: Component | null = null;

  //   this.recursive(child => {
  //     if (child.type === type) {
  //       result = child;

  //       return false;
  //     }
  //   });

  //   return result;
  // }

  // getComponentsByType(type: string) {
  //   const result: Component[] = [];

  //   this.recursive(child => {
  //     if (child.type === type) {
  //       result.push(child);
  //     }
  //   });

  //   return result;
  // }
}

// export interface Drawable {
//   render: ObserveFunc;
//   draw(): void;
//   update(): void;
// }
