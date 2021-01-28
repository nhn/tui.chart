import { observable, observe, notify, notifyByPath, computed, watch, extend as reactiveExtend, invisibleWork, } from "./reactive";
import { isUndefined, forEach, pickPropertyWithMakeup, deepCopy } from "../helpers/utils";
export default class Store {
    constructor(initStoreState) {
        this.computed = {};
        this.actions = {};
        this.initStoreState = deepCopy(initStoreState);
        this.setRootState({});
    }
    setRootState(state) {
        observable(state);
        this.state = state;
    }
    setComputed(namePath, fn, holder = this.computed) {
        const splited = namePath.split('.');
        const key = splited.splice(splited.length - 1, 1)[0];
        const target = pickPropertyWithMakeup(holder, splited);
        computed(target, key, fn.bind(null, this.state, this.computed));
    }
    setWatch(namePath, fn) {
        return watch(this, namePath, fn);
    }
    setAction(name, fn) {
        this.actions[name] = fn;
    }
    dispatch(name, payload, isInvisible) {
        // observe.setlayout 안에서 setLayout 액션이 실행되니까 여기서 state.layout getter가 실행되고
        // state.layout의 옵져버로 observe.setLayout이 등록된다. 여기서 무한루프
        // 즉 observe하고 안에서 특정 대상을 쓸때
        // extend(state.layout, layouts); 이런식으로 하게되면 layout의 getter실행되어
        // layout을 업데이트하려고 만든 observe를 옵저버로 등록해서 무한루프
        if (isInvisible) {
            invisibleWork(() => {
                // console.log('dispatch', name, ...args);
                this.actions[name].call(this, this, payload);
                // console.log('dispatch end', name);
            });
        }
        else {
            this.actions[name].call(this, this, payload);
        }
    }
    observe(fn) {
        return observe(fn.bind(this, this.state, this.computed));
    }
    observable(target) {
        return observable(target);
    }
    notifyByPath(namePath) {
        notifyByPath(this, namePath);
    }
    notify(target, key) {
        notify(target, key);
    }
    setModule(name, param) {
        if (!param) {
            param = name;
            name = param.name;
        }
        if (param.state) {
            const moduleState = typeof param.state === 'function' ? param.state(this.initStoreState) : param.state;
            extend(this.state, moduleState);
        }
        if (param.computed) {
            forEach(param.computed, (item, key) => {
                this.setComputed(key, item);
            });
        }
        if (param.watch) {
            forEach(param.watch, (item, key) => {
                this.setWatch(key, item);
            });
        }
        if (param.action) {
            forEach(param.action, (item, key) => {
                this.setAction(key, item);
            });
        }
        if (param.observe) {
            forEach(param.observe, (item) => {
                this.observe(item);
            });
        }
    }
    setValue(target, key, source) {
        extend(target, {
            [key]: source,
        });
    }
}
export function extend(target, source) {
    const newItems = {};
    for (const k in source) {
        if (!source.hasOwnProperty(k)) {
            continue;
        }
        if (!isUndefined(target[k])) {
            if (typeof source[k] === 'object' && !Array.isArray(source[k])) {
                extend(target[k], source[k]);
            }
            else {
                target[k] = source[k];
            }
        }
        else {
            newItems[k] = source[k];
        }
    }
    if (Object.keys(newItems).length) {
        reactiveExtend(target, newItems);
    }
}
