import { debounce } from "../helpers/utils";
export default class ComponentManager {
    constructor({ store, eventBus }) {
        this.components = [];
        this.store = store;
        this.eventBus = eventBus;
    }
    add(ComponentCtor, initialParam) {
        const component = new ComponentCtor({
            store: this.store,
            eventBus: this.eventBus,
        });
        if (component.initialize) {
            component.initialize(initialParam);
        }
        let proc = (...args) => {
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
    remove(ComponentCtor) {
        this.components = this.components.filter((component) => !(component instanceof ComponentCtor));
    }
    clear() {
        this.components = [];
        this.eventBus.emit('needDraw');
    }
    invoke(method, params) {
        this.components.forEach((component) => {
            const fn = component[method];
            if (fn) {
                fn.call(component, params);
            }
        });
    }
    forEach(iteratee) {
        this.components.forEach(iteratee);
    }
}
