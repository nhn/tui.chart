import { isNull, pickProperty } from "../helpers/utils";
import { message } from "../message";
let currentCollectorObserver = null;
let currentRunningObserver = null;
const observerCallCue = [];
let doingInvisibleWork = false;
export function observe(fn) {
    const observer = () => {
        if (currentRunningObserver === observer) {
            return;
        }
        // If there is observer running or doing invisible work
        if (doingInvisibleWork || !isNull(currentRunningObserver)) {
            if (observerCallCue.includes(observer)) {
                observerCallCue.splice(observerCallCue.indexOf(observer), 1);
            }
            // We use observer call cue because avoid nested observer call.
            observerCallCue.push(observer);
            // or If there are no observers running. Run the observer and run the next observer in the call queue.
        }
        else if (isNull(currentRunningObserver)) {
            currentRunningObserver = observer;
            fn();
            currentRunningObserver = null;
            digestObserverCallCue();
        }
    };
    observer.deps = [];
    // first observer excution for collect dependencies
    currentCollectorObserver = observer;
    currentCollectorObserver();
    currentCollectorObserver = null;
    return () => {
        observer.deps.forEach((dep) => {
            const index = dep.findIndex((ob) => ob === observer);
            dep.splice(index, 1);
        });
        observer.deps = [];
    };
}
function digestObserverCallCue() {
    if (observerCallCue.length) {
        const nextObserver = observerCallCue.shift();
        if (nextObserver) {
            nextObserver();
        }
    }
}
export function isObservable(target) {
    return typeof target === 'object' && target.__toastUIChartOb__;
}
export function observable(target, source = target) {
    if (isObservable(source)) {
        throw new Error(message.ALREADY_OBSERVABLE_ERROR);
    }
    if (!isObservable(target)) {
        Object.defineProperty(target, '__toastUIChartOb__', {
            enumerable: false,
        });
    }
    for (const key in source) {
        if (!source.hasOwnProperty(key)) {
            continue;
        }
        const obs = [];
        let value = source[key];
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        const preGetter = descriptor && descriptor.get;
        const preSetter = descriptor && descriptor.set;
        /* eslint-disable no-loop-func */
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get: function () {
                // It's some kind a trick to get observable information from closure using getter for notify()
                if (currentCollectorObserver === observableInfo) {
                    return { target, key, value, obs };
                }
                if (!doingInvisibleWork &&
                    currentCollectorObserver &&
                    !obs.includes(currentCollectorObserver)) {
                    // if there is collector observer in running, collect current data as dependency
                    obs.push(currentCollectorObserver);
                    currentCollectorObserver.deps.push(obs);
                }
                return value;
            },
            set: function (v) {
                const prevValue = value;
                if (preSetter) {
                    preSetter.call(target, v);
                    value = preGetter ? preGetter.call(target) : target[key];
                }
                else {
                    value = v;
                }
                if (prevValue !== value) {
                    // Run observers
                    invokeObs(obs);
                }
            },
        });
        if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
            observable(target[key]);
        }
        /* eslint-enable no-loop-func */
    }
    return target;
}
export function setValue(target, key, source) {
    return observable(target, {
        [key]: source,
    });
}
export function extend(target, source) {
    if (isObservable(source)) {
        throw new Error(message.ALREADY_OBSERVABLE_ERROR);
    }
    return observable(target, source);
}
export function notify(target, key) {
    const obInfo = observableInfo(target, key);
    if (obInfo) {
        invokeObs(obInfo.obs);
    }
}
export function invisibleWork(fn) {
    doingInvisibleWork = true;
    fn();
    doingInvisibleWork = false;
    digestObserverCallCue();
}
export function notifyByPath(holder, namePath) {
    const splited = namePath.split('.');
    const key = splited.splice(splited.length - 1, 1)[0];
    const target = pickProperty(holder, splited);
    if (target) {
        notify(target, key);
    }
}
function invokeObs(obs) {
    obs.forEach((ob) => ob());
}
function observableInfo(target, key) {
    currentCollectorObserver = observableInfo;
    const obInfo = target[key];
    currentCollectorObserver = null;
    if (typeof obInfo === 'object' &&
        obInfo.hasOwnProperty('target') &&
        obInfo.hasOwnProperty('obs')) {
        return obInfo;
    }
    return null;
}
export function computed(target, key, fn) {
    let cachedValue;
    const computedBox = {};
    Object.defineProperty(computedBox, key, {
        configurable: true,
        enumerable: true,
        get: () => cachedValue,
    });
    extend(target, computedBox);
    observe(() => {
        const prevValue = cachedValue;
        cachedValue = fn();
        if (prevValue !== cachedValue) {
            target[key] = cachedValue;
        }
    });
}
export function watch(holder, path, fn) {
    const splited = path.split('.');
    const key = splited.splice(splited.length - 1, 1)[0];
    const target = pickProperty(holder, splited);
    if (!target) {
        return null;
    }
    const obInfo = observableInfo(target, key);
    if (!obInfo) {
        return null;
    }
    const watcher = () => {
        fn(target[key]);
    };
    obInfo.obs.push(watcher);
    return () => {
        const index = obInfo.obs.findIndex((ob) => ob === watcher);
        if (index > -1) {
            obInfo.obs.splice(index, 1);
        }
    };
}
export function makeObservableObjectToNormal(obj) {
    return JSON.parse(JSON.stringify(obj));
}
