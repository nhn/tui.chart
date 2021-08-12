import { FunctionPropertyNames } from "../../types/store/store";
import Store from "../store/store";
import EventEmitter from "../eventEmitter";
import Component from "./component";
declare type ComponentConstructor<T> = new ({ store, eventBus, }: {
    store: Store<T>;
    eventBus: EventEmitter;
}) => Component;
export default class ComponentManager<T> {
    components: Component[];
    store: Store<T>;
    eventBus: EventEmitter;
    constructor({ store, eventBus }: {
        store: Store<T>;
        eventBus: EventEmitter;
    });
    add(ComponentCtor: ComponentConstructor<T>, initialParam?: any): void;
    remove(ComponentCtor: ComponentConstructor<T>): void;
    clear(): void;
    invoke(method: FunctionPropertyNames<Component>, params: any): void;
    forEach(iteratee: (component: Component, index: number) => void): void;
}
export {};
