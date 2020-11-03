import { Options } from '@t/store/store';
import { isFunction, includes, isBoolean, isString } from '@src/helpers/utils';
import { DataLabelAnchor, SeriesDataType, SubDataLabel, DataLabelOptions } from '@t/options';
import {
  DataLabel,
  DataLabelOption,
  PointDataLabel,
  RectDataLabel,
  RadialDataLabel,
  LineDataLabel,
  DataLabelType,
} from '@t/components/dataLabels';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';
import { getRadialAnchorPosition, makeAnchorPositionParam } from '@src/helpers/sector';
import { labelStyle } from '@src/brushes/label';

const RADIUS_PADDING = 30;

type LabelPosition = {
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
};

function getDefaultAnchor(type: DataLabelType, withStack = false): DataLabelAnchor {
  let anchor: DataLabelAnchor = 'auto';

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

function getAnchor(
  dataLabelOptions: DataLabelOptions,
  type: DataLabelType,
  withStack = false
): DataLabelAnchor {
  return type !== 'stackTotal' &&
    includes(['center', 'start', 'end', 'auto'], dataLabelOptions.anchor)
    ? dataLabelOptions.anchor!
    : getDefaultAnchor(type, withStack);
}

export function getDefaultDataLabelsOptions(
  dataLabelOptions: DataLabelOptions,
  type: DataLabelType,
  withStack = false
): DataLabelOption {
  const anchor = getAnchor(dataLabelOptions, type, withStack);
  const { offsetX = 0, offsetY = 0 } = dataLabelOptions;
  const formatter = isFunction(dataLabelOptions.formatter)
    ? dataLabelOptions.formatter!
    : (value: SeriesDataType) => String(value) || '';
  const options: DataLabelOption = {
    anchor,
    offsetX,
    offsetY,
    formatter,
    style: dataLabelOptions.style,
  };

  if (withStack) {
    options.stackTotal = {
      visible: isBoolean(dataLabelOptions.stackTotal?.visible)
        ? dataLabelOptions.stackTotal?.visible
        : true,
      style: dataLabelOptions.stackTotal?.style,
    } as Required<SubDataLabel>;
  }

  if (type === 'sector' && dataLabelOptions.pieSeriesName?.visible) {
    options.pieSeriesName = { ...{ anchor: 'center' }, ...dataLabelOptions.pieSeriesName };
  }

  return options;
}

export function makePointLabelInfo(
  point: PointDataLabel,
  dataLabelOptions: DataLabelOption
): DataLabel {
  const { anchor, offsetX = 0, offsetY = 0, formatter } = dataLabelOptions;
  const { x, y, name } = point;
  let textBaseline: CanvasTextBaseline = 'middle';

  if (anchor === 'end') {
    textBaseline = 'bottom';
  } else if (anchor === 'start') {
    textBaseline = 'top';
  }

  return {
    type: 'point',
    x: x + offsetX,
    y: y + offsetY,
    text: formatter(point.value!),
    textAlign: 'center',
    textBaseline,
    name,
  };
}

function isHorizontal(direction: string): boolean {
  return includes(['left', 'right'], direction);
}

function makeHorizontalRectPosition(rect: RectDataLabel, anchor: DataLabelAnchor): LabelPosition {
  const { x, y, width, height, direction } = rect;
  const textBaseline: CanvasTextBaseline = 'middle';
  const posY = y + height / 2;

  let textAlign: CanvasTextAlign = 'center';
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
  } else {
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

function makeVerticalRectPosition(rect: RectDataLabel, anchor: DataLabelAnchor): LabelPosition {
  const { x, y, width, height, direction } = rect;
  const textAlign: CanvasTextAlign = 'center';
  const posX = x + width / 2;

  let textBaseline: CanvasTextBaseline = 'middle';
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
  } else {
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
function getFont(
  type: 'stackTotal' | 'rect' | 'treemapSeriesName',
  dataLabelOptions: DataLabelOption
) {
  return type === 'stackTotal'
    ? dataLabelOptions.stackTotal?.style?.font ?? labelStyle.stackTotal.font
    : dataLabelOptions.style?.font ?? labelStyle['default'].font;
}

function adjustOverflowHorizontalRect(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption,
  position: Pick<LabelPosition, 'x' | 'textAlign'>
): Pick<LabelPosition, 'x' | 'textAlign'> {
  const { type, width, value, direction, plot } = rect;
  const { formatter } = dataLabelOptions;
  const font = getFont(type, dataLabelOptions);
  const text = isString(value) ? value : formatter(value!);
  const textWidth = getTextWidth(text, font!);

  let { x, textAlign } = position;

  const isOverflow = (direction === 'left' && x - textWidth < 0) || x + textWidth > plot!.size;

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

function adjustOverflowVerticalRect(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption,
  position: Pick<LabelPosition, 'y' | 'textBaseline'>
): Pick<LabelPosition, 'y' | 'textBaseline'> {
  const { type, height, direction, plot } = rect;
  const font = getFont(type, dataLabelOptions);

  const plotSize = plot!.size;
  const textHeight = getTextHeight(font!);

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

function makeHorizontalRectLabelInfo(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption
): LabelPosition {
  const { anchor, offsetX = 0, offsetY = 0 } = dataLabelOptions;
  const {
    direction,
    plot: { x: startOffsetX = 0, y: startOffsetY = 0 },
  } = rect;
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
  } else {
    posX = posX + offsetX;
  }

  const padding = 5;

  if (textAlign === 'right') {
    posX -= padding;
  } else if (textAlign === 'left') {
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

function makeVerticalRectLabelInfo(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption
): LabelPosition {
  const { anchor, offsetX = 0, offsetY = 0 } = dataLabelOptions;
  const {
    direction,
    plot: { x: startOffsetX = 0, y: startOffsetY = 0 },
  } = rect;
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
  } else if (direction === 'bottom') {
    posY = posY - offsetY;
  }

  const padding = 5;

  if (textBaseline === 'bottom') {
    posY -= padding;
  } else if (textBaseline === 'top') {
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

export function makeRectLabelInfo(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption
): DataLabel {
  const { type, value, direction, name } = rect;
  const { formatter } = dataLabelOptions;
  const horizontal = isHorizontal(direction);
  const labelPosition = horizontal
    ? makeHorizontalRectLabelInfo(rect, dataLabelOptions)
    : makeVerticalRectLabelInfo(rect, dataLabelOptions);

  return {
    type: type as DataLabelType,
    ...labelPosition,
    text: isString(value) ? value : formatter(value!),
    name,
    hasTextBubble:
      rect.type === 'stackTotal' || (rect.type === 'rect' && rect.modelType === 'bullet'),
  };
}

export function makeSectorLabelPosition(
  model: RadialDataLabel,
  dataLabelOptions: DataLabelOption
): LabelPosition {
  const position = getRadialAnchorPosition(makeAnchorPositionParam('center', model));

  return {
    ...position,
    textAlign: 'center',
    textBaseline: dataLabelOptions.pieSeriesName?.anchor === 'center' ? 'bottom' : 'middle',
  };
}

export function makeSectorLabelInfo(
  model: RadialDataLabel,
  dataLabelOptions: DataLabelOption
): DataLabel {
  const { formatter } = dataLabelOptions;
  const labelPosition = makeSectorLabelPosition(model, dataLabelOptions);
  const { value, name } = model;

  return {
    type: 'sector',
    ...labelPosition,
    text: formatter(value!),
    name,
  };
}

export function makePieSeriesNameLabelInfo(
  model: RadialDataLabel,
  dataLabelOptions: DataLabelOption
): DataLabel {
  const seriesNameAnchor = dataLabelOptions.pieSeriesName?.anchor;
  const hasOuterAnchor = seriesNameAnchor === 'outer';
  const textBaseline = hasOuterAnchor ? 'middle' : 'top';
  let defaultColor!: string;

  if (hasOuterAnchor) {
    defaultColor = model.color;
  }

  const position = getRadialAnchorPosition(
    makeAnchorPositionParam(hasOuterAnchor ? 'end' : 'center', {
      ...model,
      radius: {
        ...model.radius,
        outer: hasOuterAnchor ? model.radius.outer + RADIUS_PADDING : model.radius.outer,
      },
    })
  );

  return {
    type: 'pieSeriesName',
    ...position,
    text: model.name!,
    textBaseline,
    textAlign: 'center',
    defaultColor,
  };
}

export function getDataLabelsOptions(options: Options, name: string) {
  return options?.series?.[name]?.dataLabels || options?.series?.dataLabels || {};
}

export function makeLineLabelInfo(model: LineDataLabel, dataLabelOptions: DataLabelOption) {
  const { value, textAlign, textBaseline } = model;
  const { formatter } = dataLabelOptions;

  return {
    ...model,
    textAlign: textAlign ?? 'center',
    textBaseline: textBaseline ?? 'middle',
    text: isString(value) ? value : formatter(value!),
  };
}
