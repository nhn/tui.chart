import { getFirstValidValue, includes, isNumber } from "../helpers/utils";
import { setSplineControlPoint } from "../helpers/calculator";
import { isSameArray } from "../helpers/arrayUtil";
export default class Component {
    constructor({ store, eventBus }) {
        this.name = 'Component';
        this.type = 'component';
        this.rect = {
            x: 0,
            y: 0,
            height: 0,
            width: 0,
        };
        this.isShow = true;
        this.store = store;
        this.eventBus = eventBus;
    }
    update(delta) {
        if (!this.drawModels) {
            return;
        }
        if (Array.isArray(this.models)) {
            this.updateModels(this.drawModels, this.models, delta);
        }
        else {
            Object.keys(this.models).forEach((type) => {
                const currentModels = this.drawModels[type];
                const targetModels = this.models[type];
                this.updateModels(currentModels, targetModels, delta);
            });
        }
    }
    initUpdate(delta) {
        this.update(delta);
    }
    updateModels(currentModels, targetModels, delta) {
        currentModels.forEach((current, index) => {
            const target = targetModels[index];
            Object.keys(current).forEach((key) => {
                var _a;
                if (!current || !target) {
                    return;
                }
                if (key[0] !== '_') {
                    if (isNumber(current[key])) {
                        current[key] = current[key] + (target[key] - current[key]) * delta;
                    }
                    else if (key === 'points') {
                        const matchedModel = this.getCurrentModelToMatchTargetModel(current[key], current[key], target[key]);
                        const newPoints = matchedModel.map((curPoint, idx) => {
                            const next = target[key][idx];
                            if (curPoint && next) {
                                const { x, y } = curPoint;
                                const { x: nextX, y: nextY } = next;
                                return Object.assign(Object.assign({}, next), { x: x + (nextX - x) * delta, y: y + (nextY - y) * delta });
                            }
                            return next;
                        });
                        if ((_a = this.store.state.options.series) === null || _a === void 0 ? void 0 : _a.spline) {
                            setSplineControlPoint(newPoints);
                        }
                        current[key] = newPoints;
                    }
                    else {
                        current[key] = target[key];
                    }
                }
            });
        });
    }
    sync() {
        if (!this.drawModels) {
            return;
        }
        if (Array.isArray(this.models)) {
            this.syncModels(this.drawModels, this.models);
        }
        else if (!Object.keys(this.models).length) {
            this.drawModels = this.models;
        }
        else {
            Object.keys(this.models).forEach((type) => {
                const currentModels = this.drawModels[type];
                const targetModels = this.models[type];
                this.syncModels(currentModels, targetModels, type);
            });
        }
    }
    getCurrentModelToMatchTargetModel(models, currentModels, targetModels) {
        var _a;
        if (!models || !currentModels) {
            return [...targetModels];
        }
        if ((_a = getFirstValidValue(targetModels)) === null || _a === void 0 ? void 0 : _a.name) {
            const modelNames = [...new Set(models.map(({ name }) => name))];
            const targetNames = [...new Set(targetModels.map(({ name }) => name))];
            const same = isSameArray(modelNames, targetNames);
            if (!same) {
                return this.getCurrentModelWithDifferentModel(models, currentModels, targetModels, modelNames, targetNames);
            }
        }
        const currentLength = currentModels.length;
        const targetLength = targetModels.length;
        if (currentLength < targetLength) {
            return [...currentModels, ...targetModels.slice(currentLength, targetLength)];
        }
        if (currentLength > targetLength) {
            return currentModels.slice(0, targetLength);
        }
        return models;
    }
    getCurrentModelWithDifferentModel(models, currentModels, targetModels, modelNames, targetNames) {
        const currentLength = currentModels.length;
        const targetLength = targetModels.length;
        if (currentLength > targetLength) {
            const newModels = models.filter(({ name }) => includes(targetNames, name));
            return newModels.length !== targetModels.length ? targetModels : newModels;
        }
        if (currentLength < targetLength) {
            const notIncludedModels = targetModels.reduce((acc, cur, idx) => {
                const notIncluded = !includes(modelNames, cur.name);
                return notIncluded
                    ? {
                        models: [...acc.models, cur],
                        modelIdx: [...acc.modelIdx, idx],
                    }
                    : acc;
            }, { models: [], modelIdx: [] });
            if (models.length + notIncludedModels.models.length === targetLength) {
                const newModels = [...models];
                notIncludedModels.models.forEach((model, idx) => {
                    newModels.splice(notIncludedModels.modelIdx[idx], 0, model);
                });
                return newModels;
            }
            return targetModels;
        }
        return models;
    }
    syncModels(currentModels, targetModels, type) {
        const drawModels = type ? this.drawModels[type] : this.drawModels;
        const model = this.getCurrentModelToMatchTargetModel(drawModels, currentModels, targetModels);
        if (type) {
            this.drawModels[type] = model;
        }
        else {
            this.drawModels = model;
        }
    }
    getSelectableOption(options) {
        var _a, _b, _c;
        return _c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.selectable, (_c !== null && _c !== void 0 ? _c : false);
    }
    renderDataLabels(data, name) {
        setTimeout(() => {
            this.eventBus.emit('renderDataLabels', { data, name: (name !== null && name !== void 0 ? name : this.name) });
        }, 0);
    }
    draw(painter) {
        const models = this.drawModels ? this.drawModels : this.models;
        if (Array.isArray(models)) {
            painter.paintForEach(models);
        }
        else if (models) {
            Object.keys(models).forEach((item) => {
                painter.paintForEach(models[item]);
            });
        }
    }
}
