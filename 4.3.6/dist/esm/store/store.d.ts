import { ChartState, InitStoreState, ActionFunc, StoreOptions, ComputedFunc, WatchFunc, StoreModule, ObserveFunc, Options } from "../../types/store/store";
export default class Store<T extends Options> {
    state: ChartState<T>;
    initStoreState: InitStoreState<T>;
    computed: Record<string, any>;
    actions: Record<string, ActionFunc>;
    constructor(initStoreState: InitStoreState<T>);
    setRootState(state: Partial<ChartState<T>>): void;
    setComputed(namePath: string, fn: ComputedFunc, holder?: any): void;
    setWatch(namePath: string, fn: WatchFunc): Function | null;
    setAction(name: string, fn: ActionFunc): void;
    dispatch(name: string, payload?: any, isInvisible?: boolean): void;
    observe(fn: ObserveFunc): Function;
    observable(target: Record<string, any>): Record<string, any>;
    notifyByPath(namePath: string): void;
    notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K): void;
    setModule(name: string | StoreModule, param?: StoreOptions | StoreModule): void;
    setValue(target: Record<string, any>, key: string, source: Record<string, any>): void;
}
export declare function extend<T extends Record<string, any>>(target: T, source: Partial<T>): void;
