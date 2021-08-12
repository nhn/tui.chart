import { isFunction, includes, isBoolean, isString } from "./utils";
import { getTextWidth, getTextHeight } from "./calculator";
import { getRadialAnchorPosition, makeAnchorPositionParam, calculateDegreeToRadian, getRadialLabelAlign, } from "./sector";
import { getFont } from "./style";
export const RADIUS_PADDING = 30;
const CALLOUT_LENGTH = 20;
function getDefaultAnchor(type, withStack = false) {
    let anchor = 'auto';
    switch (type) {
        case 'point':
            anchor = 'center';
            break;
        case 'rect':
            anchor = !withStack ? 'auto' : 'center';
            break;
        case 'sector':
        case 'treemapSeriesName':
            anchor = 'center';
            break;
        case 'stackTotal':
            anchor = 'auto';
            break;
    }
    return anchor;
}
function getAnchor(dataLabelOptions, type, withStack = false) {
    return type !== 'stackTotal' &&
        includes(['center', 'start', 'end', 'auto', 'outer'], dataLabelOptions.anchor)
        ? dataLabelOptions.anchor
        : getDefaultAnchor(type, withStack);
}
export function getDefaultDataLabelsOptions(dataLabelOptions, type, withStack = false) {
    var _a, _b, _c;
    const anchor = getAnchor(dataLabelOptions, type, withStack);
    const { offsetX = 0, offsetY = 0 } = dataLabelOptions;
    const formatter = isFunction(dataLabelOptions.formatter)
        ? dataLabelOptions.formatter
        : (value) => String(value) || '';
    const options = {
        anchor,
        offsetX,
        offsetY,
        formatter,
    };
    if (withStack) {
        const stackTotal = dataLabelOptions.stackTotal;
        options.stackTotal = {
            visible: isBoolean((_a = stackTotal) === null || _a === void 0 ? void 0 : _a.visible) ? stackTotal.visible : true,
            formatter: isFunction((_b = stackTotal) === null || _b === void 0 ? void 0 : _b.formatter) ? stackTotal.formatter : formatter,
        };
    }
    if (type === 'sector' && ((_c = dataLabelOptions.pieSeriesName) === null || _c === void 0 ? void 0 : _c.visible)) {
        options.pieSeriesName = Object.assign({ anchor: 'center' }, dataLabelOptions.pieSeriesName);
    }
    return options;
}
export function makePointLabelInfo(point, dataLabelOptions, rect) {
    const { width, height } = rect;
    const { anchor, offsetX = 0, offsetY = 0, formatter } = dataLabelOptions;
    const { name, theme } = point;
    let textBaseline = 'middle';
    if (anchor === 'end') {
        textBaseline = 'bottom';
    }
    else if (anchor === 'start') {
        textBaseline = 'top';
    }
    const xWithOffset = point.x + offsetX;
    const yWithOffset = point.y + offsetY;
    const x = xWithOffset < 0 || xWithOffset > width ? point.x : xWithOffset;
    const y = yWithOffset < 0 || yWithOffset > height ? point.y : yWithOffset;
    return {
        type: 'point',
        x,
        y,
        text: formatter(point.value, point.data),
        textAlign: 'center',
        textBaseline,
        name,
        theme,
    };
}
function isHorizontal(direction) {
    return includes(['left', 'right'], direction);
}
function makeHorizontalRectPosition(rect, anchor) {
    const { x, y, width, height, direction } = rect;
    const textBaseline = 'middle';
    const posY = y + height / 2;
    let textAlign = 'center';
    let posX;
    if (direction === 'right') {
        switch (anchor) {
            case 'start':
                textAlign = 'left';
                posX = x;
                break;
            case 'end':
                textAlign = 'right';
                posX = x + width;
                break;
            case 'center':
                textAlign = 'center';
                posX = x + width / 2;
                break;
            default:
                textAlign = 'left';
                posX = x + width;
        }
    }
    else {
        switch (anchor) {
            case 'start':
                textAlign = 'right';
                posX = x + width;
                break;
            case 'end':
                textAlign = 'left';
                posX = x;
                break;
            case 'center':
                textAlign = 'center';
                posX = x + width / 2;
                break;
            default:
                textAlign = 'right';
                posX = x;
        }
    }
    return {
        x: posX,
        y: posY,
        textAlign,
        textBaseline,
    };
}
function makeVerticalRectPosition(rect, anchor) {
    const { x, y, width, height, direction } = rect;
    const textAlign = 'center';
    const posX = x + width / 2;
    let textBaseline = 'middle';
    let posY = 0;
    if (direction === 'top') {
        switch (anchor) {
            case 'end':
                textBaseline = 'top';
                posY = y;
                break;
            case 'start':
                textBaseline = 'bottom';
                posY = y + height;
                break;
            case 'center':
                textBaseline = 'middle';
                posY = y + height / 2;
                break;
            default:
                textBaseline = 'bottom';
                posY = y;
        }
    }
    else {
        switch (anchor) {
            case 'end':
                textBaseline = 'bottom';
                posY = y + height;
                break;
            case 'start':
                textBaseline = 'top';
                posY = y;
                break;
            case 'center':
                textBaseline = 'middle';
                posY = y + height / 2;
                break;
            default:
                textBaseline = 'top';
                posY = y + height;
                break;
        }
    }
    return {
        x: posX,
        y: posY,
        textAlign,
        textBaseline,
    };
}
function adjustOverflowHorizontalRect(rect, dataLabelOptions, position) {
    const { width, value, direction, plot, theme } = rect;
    const { formatter } = dataLabelOptions;
    const font = getFont(theme);
    const text = isString(value) ? value : formatter(value);
    const textWidth = getTextWidth(text, font);
    let { x, textAlign } = position;
    const isOverflow = (direction === 'left' && x - textWidth < 0) || x + textWidth > plot.size;
    if (isOverflow) {
        x = rect.x + width;
        textAlign = 'right';
        if (direction === 'left' && width >= textWidth) {
            x = rect.x;
            textAlign = 'left';
        }
    }
    return {
        x,
        textAlign,
    };
}
function adjustOverflowVerticalRect(rect, dataLabelOptions, position) {
    const { height, direction, plot, theme, value } = rect;
    const font = getFont(theme);
    const plotSize = plot.size;
    const textHeight = getTextHeight(`${value}`, font); // @TODO: formatter 값해서 넘기기
    let { y, textBaseline } = position;
    const isOverflow = (!(direction === 'bottom') && y - textHeight < 0) || y + textHeight > plotSize;
    if (isOverflow) {
        y = rect.y;
        textBaseline = 'top';
        if (y + textHeight > plotSize) {
            y = rect.y;
            textBaseline = 'bottom';
        }
        if (direction === 'bottom') {
            y = rect.y + height;
            textBaseline = 'bottom';
        }
    }
    return {
        y,
        textBaseline,
    };
}
function makeHorizontalRectLabelInfo(rect, dataLabelOptions) {
    const { anchor, offsetX = 0, offsetY = 0 } = dataLabelOptions;
    const { direction, plot: { x: startOffsetX = 0, y: startOffsetY = 0 }, } = rect;
    const position = makeHorizontalRectPosition(rect, anchor);
    let { x: posX, y: posY, textAlign } = position;
    if (anchor === 'auto') {
        const adjustRect = adjustOverflowHorizontalRect(rect, dataLabelOptions, { x: posX, textAlign });
        posX = adjustRect.x;
        textAlign = adjustRect.textAlign;
    }
    posY += offsetY;
    if (direction === 'left') {
        posX = posX - offsetX;
    }
    else {
        posX = posX + offsetX;
    }
    const padding = 10;
    if (textAlign === 'right') {
        posX -= padding;
    }
    else if (textAlign === 'left') {
        posX += padding;
    }
    posX -= startOffsetX;
    posY -= startOffsetY;
    return {
        x: posX,
        y: posY,
        textAlign,
        textBaseline: position.textBaseline,
    };
}
function makeVerticalRectLabelInfo(rect, dataLabelOptions) {
    const { anchor, offsetX = 0, offsetY = 0 } = dataLabelOptions;
    const { direction, plot: { x: startOffsetX = 0, y: startOffsetY = 0 }, } = rect;
    const position = makeVerticalRectPosition(rect, anchor);
    let { x: posX, y: posY, textBaseline } = position;
    if (anchor === 'auto') {
        const adjustRect = adjustOverflowVerticalRect(rect, dataLabelOptions, position);
        posY = adjustRect.y;
        textBaseline = adjustRect.textBaseline;
    }
    posX += offsetX;
    if (direction === 'top') {
        posY = posY + offsetY;
    }
    else if (direction === 'bottom') {
        posY = posY - offsetY;
    }
    const padding = 5;
    if (textBaseline === 'bottom') {
        posY -= padding;
    }
    else if (textBaseline === 'top') {
        posY += padding;
    }
    posX -= startOffsetX;
    posY -= startOffsetY;
    return {
        x: posX,
        y: posY,
        textAlign: position.textAlign,
        textBaseline,
    };
}
export function makeRectLabelInfo(rect, dataLabelOptions) {
    const { type, value, direction, name, theme } = rect;
    const horizontal = isHorizontal(direction);
    const labelPosition = horizontal
        ? makeHorizontalRectLabelInfo(rect, dataLabelOptions)
        : makeVerticalRectLabelInfo(rect, dataLabelOptions);
    const formatter = type === 'stackTotal' ? dataLabelOptions.stackTotal.formatter : dataLabelOptions.formatter;
    return Object.assign(Object.assign({ type }, labelPosition), { text: isString(value) ? value : formatter(value), name, seriesColor: rect.color, theme });
}
export function makeSectorLabelPosition(model, dataLabelOptions) {
    const anchor = dataLabelOptions.anchor;
    const position = getRadialAnchorPosition(makeAnchorPositionParam(anchor, Object.assign(Object.assign({}, model), { radius: Object.assign(Object.assign({}, model.radius), { outer: anchor === 'outer' ? model.radius.outer + RADIUS_PADDING : model.radius.outer }) })));
    const textAlign = getRadialLabelAlign(model, anchor);
    return Object.assign(Object.assign({}, position), { textAlign, textBaseline: hasSameAnchorPieDataLabel(dataLabelOptions) ? 'bottom' : 'middle' });
}
function makeSectorBarLabelPosition(model, dataLabelOptions) {
    const { anchor } = dataLabelOptions;
    const { clockwise, degree: { start, end }, radius: { inner, outer }, } = model;
    let startAngle = start;
    let endAngle = end;
    let textAlign = 'center';
    let rotationDegree = (start + end) / 2;
    if (anchor === 'start') {
        textAlign = clockwise ? 'left' : 'right';
        endAngle = startAngle;
        rotationDegree = start;
    }
    else if (anchor === 'end') {
        textAlign = clockwise ? 'right' : 'left';
        startAngle = endAngle;
        rotationDegree = end;
    }
    const { x, y } = getRadialAnchorPosition(makeAnchorPositionParam(anchor, Object.assign(Object.assign({}, model), { degree: {
            start: startAngle,
            end: endAngle,
        }, radius: {
            inner: inner,
            outer: outer,
        } })));
    return {
        x,
        y,
        textAlign,
        textBaseline: 'middle',
        radian: calculateDegreeToRadian(rotationDegree, 0),
    };
}
export function makeSectorBarLabelInfo(model, dataLabelOptions) {
    const { formatter } = dataLabelOptions;
    const labelPosition = makeSectorBarLabelPosition(model, dataLabelOptions);
    const { value, name, theme: dataLabelTheme } = model;
    const theme = Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? model.color : dataLabelTheme.color });
    return Object.assign(Object.assign({ type: 'sector' }, labelPosition), { text: formatter(value), name,
        theme });
}
export function makeSectorLabelInfo(model, dataLabelOptions) {
    const { formatter } = dataLabelOptions;
    const labelPosition = makeSectorLabelPosition(model, dataLabelOptions);
    const { value, name, theme: dataLabelTheme } = model;
    const anchor = dataLabelOptions.anchor;
    const theme = Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? model.color : dataLabelTheme.color });
    return Object.assign(Object.assign({ type: 'sector' }, labelPosition), { text: formatter(value), name, callout: hasSectorCallout(dataLabelOptions) ? getPieDataLabelCallout(model, anchor) : null, theme });
}
export function makePieSeriesNameLabelInfo(model, dataLabelOptions) {
    var _a;
    const seriesNameAnchor = (_a = dataLabelOptions.pieSeriesName) === null || _a === void 0 ? void 0 : _a.anchor;
    const hasOuterAnchor = seriesNameAnchor === 'outer';
    const position = getRadialAnchorPosition(makeAnchorPositionParam(seriesNameAnchor, Object.assign(Object.assign({}, model), { radius: Object.assign(Object.assign({}, model.radius), { outer: hasOuterAnchor ? model.radius.outer + RADIUS_PADDING : model.radius.outer }) })));
    const textAlign = getRadialLabelAlign(model, seriesNameAnchor);
    const pieSeriesNameTheme = model.theme.pieSeriesName;
    const theme = Object.assign(Object.assign({}, pieSeriesNameTheme), { color: pieSeriesNameTheme.useSeriesColor ? model.color : pieSeriesNameTheme.color });
    return Object.assign(Object.assign({ type: 'pieSeriesName' }, position), { text: model.name, callout: hasPieSeriesNameCallout(dataLabelOptions)
            ? getPieDataLabelCallout(model, seriesNameAnchor)
            : null, textAlign, textBaseline: hasSameAnchorPieDataLabel(dataLabelOptions) ? 'top' : 'middle', theme });
}
export function getDataLabelsOptions(options, name) {
    var _a, _b, _c, _d, _e;
    return ((_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[name]) === null || _c === void 0 ? void 0 : _c.dataLabels) || ((_e = (_d = options) === null || _d === void 0 ? void 0 : _d.series) === null || _e === void 0 ? void 0 : _e.dataLabels) || {};
}
export function makeLineLabelInfo(model, dataLabelOptions) {
    const { value, textAlign, textBaseline } = model;
    const { formatter } = dataLabelOptions;
    return Object.assign(Object.assign({}, model), { x: model.x, y: (model.y + model.y2) / 2, textAlign: (textAlign !== null && textAlign !== void 0 ? textAlign : 'center'), textBaseline: (textBaseline !== null && textBaseline !== void 0 ? textBaseline : 'middle'), text: isString(value) ? value : formatter(value) });
}
function hasSameAnchorPieDataLabel(dataLabelOptions) {
    var _a;
    return dataLabelOptions.anchor === ((_a = dataLabelOptions.pieSeriesName) === null || _a === void 0 ? void 0 : _a.anchor);
}
function hasSectorCallout(dataLabelOptions) {
    var _a;
    return dataLabelOptions.anchor === 'outer' || ((_a = dataLabelOptions.pieSeriesName) === null || _a === void 0 ? void 0 : _a.anchor) !== 'outer';
}
function hasPieSeriesNameCallout(dataLabelOptions) {
    var _a;
    return dataLabelOptions.anchor !== 'outer' || ((_a = dataLabelOptions.pieSeriesName) === null || _a === void 0 ? void 0 : _a.anchor) === 'outer';
}
function getPieDataLabelCallout(model, anchor) {
    if (anchor !== 'outer') {
        return null;
    }
    const { x, y } = getRadialAnchorPosition(makeAnchorPositionParam('outer', Object.assign(Object.assign({}, model), { radius: Object.assign(Object.assign({}, model.radius), { outer: model.radius.outer + CALLOUT_LENGTH }) })));
    const { x: x2, y: y2 } = getRadialAnchorPosition(makeAnchorPositionParam('outer', Object.assign({}, model)));
    const { callout } = model.theme;
    const theme = Object.assign(Object.assign({}, callout), { lineColor: callout.useSeriesColor ? model.color : callout.lineColor });
    return { x, y, x2, y2, theme };
}
