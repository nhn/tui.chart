import { StoreModule } from '@t/store/store';
import { pickStackOption } from '@src/store/stackSeriesData';
import { isFunction, includes, isBoolean, pick } from '@src/helpers/utils';
import {
  DataLabels,
  DataLabelStyle,
  DataLabelAnchor,
  SeriesDataType,
  DataLabelPieSeriesName,
} from '@t/options';
import { PointModel, RectModel, SectorModel } from '@t/components/series';
import { DataLabel, DataLabelOption, DataLabelStackTotal } from '@t/components/dataLabels';
import { strokeLabelStyle, labelStyle } from '@src/brushes/label';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';
import { getRadialPosition } from '@src/helpers/sector';

type LabelPosition = {
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
};
type DataLabelType = 'point' | 'radial' | 'rect' | 'stackTotal';
type DefaultDataLabelOptions = {
  anchor: DataLabelAnchor;
  style: Required<DataLabelStyle>;
  stackTotal?: Required<DataLabelStackTotal>;
  formatter?: (value: any) => string;
  pieSeriesName?: DataLabelPieSeriesName;
};
export type PointDataLabel = PointModel & {
  type: 'point';
};
export type RadialDataLabel = Omit<SectorModel, 'type'> & {
  type: 'radial';
};
export type RectDirection = 'top' | 'bottom' | 'left' | 'right';
export type RectDataLabel = Omit<RectModel, 'type' | 'color'> & {
  type: 'rect' | 'stackTotal';
  direction: RectDirection;
  plot: {
    x: number;
    y: number;
    size: number;
  };
};

function getDefaultOptions(type: DataLabelType, withStack = false): DefaultDataLabelOptions {
  const style: Required<DataLabelStyle> = {
    font: labelStyle['default'].font,
    color: labelStyle['default'].fillStyle,
    textStrokeColor: strokeLabelStyle['default'].strokeStyle,
  };

  let anchor: DataLabelAnchor = 'auto';

  switch (type) {
    case 'point':
      anchor = 'center';
      break;
    case 'rect':
      anchor = !withStack ? 'auto' : 'center';
      break;
    case 'radial':
      anchor = 'center';
      style.color = '#ffffff';
      style.textStrokeColor = 'rgba(0,0,0,0)';
      style.font = '100 15px Arial';
      break;
    case 'stackTotal':
      anchor = 'auto';
      style.font = '600 11px Arial';
      break;
  }

  const options: DefaultDataLabelOptions = {
    anchor,
    style,
  };

  if (withStack) {
    options.stackTotal = {
      visible: true,
      style,
    };
  }

  if (type === 'radial') {
    options.formatter = function (value) {
      return `${value}%`;
    };
    options.pieSeriesName = {
      visible: false,
      anchor: 'center',
    };
  }

  return options;
}

function getAnchor(dataLabelOptions: DataLabels, defaultOptions: DataLabels): DataLabelAnchor {
  return includes(['center', 'start', 'end', 'auto'], dataLabelOptions.anchor)
    ? dataLabelOptions.anchor!
    : defaultOptions.anchor!;
}

function getStyle(
  defaultStyle: Required<DataLabelStyle>,
  style?: DataLabelStyle
): Required<DataLabelStyle> {
  const { font, color, textStrokeColor } = defaultStyle;

  return {
    font: style?.font ?? font,
    color: style?.color ?? color,
    textStrokeColor: style?.textStrokeColor ?? textStrokeColor,
  };
}

export function getDataLabelsOptions(
  dataLabelOptions: DataLabels,
  type: DataLabelType,
  withStack = false
): DataLabelOption {
  const defaultOptions = getDefaultOptions(type, withStack);
  const anchor =
    type === 'stackTotal' ? defaultOptions.anchor : getAnchor(dataLabelOptions, defaultOptions);
  const { offsetX = 0, offsetY = 0 } = dataLabelOptions;
  const defaultFormatter = defaultOptions.formatter
    ? defaultOptions.formatter
    : (value: SeriesDataType) => String(value) || '';
  const formatter = isFunction(dataLabelOptions.formatter)
    ? dataLabelOptions.formatter!
    : defaultFormatter;
  const style = getStyle(defaultOptions.style as Required<DataLabelStyle>, dataLabelOptions.style);
  const options: DataLabelOption = { anchor, offsetX, offsetY, formatter, style };

  if (withStack) {
    options.stackTotal = {
      visible: isBoolean(dataLabelOptions.stackTotal?.visible)
        ? dataLabelOptions.stackTotal?.visible
        : true,
      style: getStyle(
        defaultOptions.stackTotal!.style as Required<DataLabelStyle>,
        dataLabelOptions.stackTotal?.style
      ),
    } as DataLabelStackTotal;
  }

  if (type === 'radial' && dataLabelOptions.pieSeriesName?.visible) {
    options.pieSeriesName = {
      ...defaultOptions.pieSeriesName,
      ...dataLabelOptions.pieSeriesName,
    };
  }

  return options;
}

function makePointLabelInfo(point: PointDataLabel, dataLabelOptions: DataLabelOption): DataLabel {
  const { anchor, offsetX = 0, offsetY = 0, formatter, style } = dataLabelOptions;
  const { x, y } = point;

  let textBaseline: CanvasTextBaseline = 'middle';

  if (anchor === 'end') {
    textBaseline = 'bottom';
  } else if (anchor === 'start') {
    textBaseline = 'top';
  }

  return {
    x: x + offsetX,
    y: y + offsetY,
    text: formatter(point.value!),
    textAlign: 'center',
    textBaseline,
    style,
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
  let posX = x;

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

function adjustOverflowHorizontalRect(
  rect: RectDataLabel,
  dataLabelOptions: DataLabelOption,
  position: Pick<LabelPosition, 'x' | 'textAlign'>
): Pick<LabelPosition, 'x' | 'textAlign'> {
  const { width, value, direction, plot } = rect;
  const {
    formatter,
    style: { font },
  } = dataLabelOptions;
  const text = formatter(value!);
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
  const { height, direction, plot } = rect;
  const {
    style: { font },
  } = dataLabelOptions;

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

function makeRectLabelInfo(rect: RectDataLabel, dataLabelOptions: DataLabelOption): DataLabel {
  const { type, value, direction } = rect;
  const { formatter, style, stackTotal } = dataLabelOptions;
  const horizontal = isHorizontal(direction);
  const labelPosition = horizontal
    ? makeHorizontalRectLabelInfo(rect, dataLabelOptions)
    : makeVerticalRectLabelInfo(rect, dataLabelOptions);

  return {
    ...labelPosition,
    text: formatter(value!),
    style: type === 'stackTotal' ? stackTotal?.style! : style,
  };
}

function makeRadialLabelPosition(
  model: RadialDataLabel,
  dataLabelOptions: DataLabelOption
): LabelPosition {
  const param = pick(model, 'x', 'y', 'radius', 'startDegree', 'endDegree');
  const position = getRadialPosition({
    anchor: 'center',
    ...param,
  });

  return {
    ...position,
    textAlign: 'center',
    textBaseline: dataLabelOptions.pieSeriesName?.anchor === 'center' ? 'bottom' : 'middle',
  };
}

function makeRadialLabelInfo(model: RadialDataLabel, dataLabelOptions: DataLabelOption): DataLabel {
  const { formatter, style } = dataLabelOptions;
  const labelPosition = makeRadialLabelPosition(model, dataLabelOptions);

  return {
    ...labelPosition,
    text: formatter(model.value!),
    style,
  };
}

function makeRadialSeriesNameLabelInfo(
  model: RadialDataLabel,
  dataLabelOptions: DataLabelOption
): DataLabel {
  const seriesNameAnchor = dataLabelOptions.pieSeriesName?.anchor;
  const hasOuterAnchor = seriesNameAnchor === 'outer';
  const textBaseline = hasOuterAnchor ? 'middle' : 'top';
  const color = hasOuterAnchor ? (model as RadialDataLabel).color : '#ffffff';

  const param = pick(model as RadialDataLabel, 'x', 'y', 'radius', 'startDegree', 'endDegree');
  param.radius += hasOuterAnchor ? 25 : 0;

  const position = getRadialPosition({
    anchor: hasOuterAnchor ? 'end' : 'center',
    ...param,
  });

  return {
    ...position,
    textBaseline,
    textAlign: 'center',
    text: (model as RadialDataLabel).name,
    style: {
      font: '400 11px Arial',
      color,
      textStrokeColor: 'rgba(0,0,0,0)',
    },
  };
}

const dataLabels: StoreModule = {
  name: 'dataLabels',
  state: ({ options }) => ({
    dataLabels: {
      visible: !!options.series?.dataLabels?.visible,
      data: [],
    },
  }),
  action: {
    appendDataLabels(
      { state },
      dataLabelData: Array<PointDataLabel | RadialDataLabel | RectDataLabel>
    ) {
      const { options } = state;
      const dataLabelOptions = options.series?.dataLabels!;
      const withStack = !!pickStackOption(options);
      const labels: DataLabel[] = [];

      dataLabelData.forEach((model) => {
        const { type, value } = model;
        const labelOptions = getDataLabelsOptions(dataLabelOptions, type, withStack);
        const disableStackTotal = type === 'stackTotal' && !labelOptions.stackTotal?.visible;

        if (disableStackTotal || !value) {
          return;
        }

        let dataLabel!: DataLabel;

        if (type === 'point') {
          dataLabel = makePointLabelInfo(model as PointDataLabel, labelOptions);
        } else if (type === 'radial') {
          dataLabel = makeRadialLabelInfo(model as RadialDataLabel, labelOptions);

          if (labelOptions.pieSeriesName?.visible) {
            const seriesNameLabel = makeRadialSeriesNameLabelInfo(
              model as RadialDataLabel,
              labelOptions
            );

            labels.push(seriesNameLabel);
          }
        } else {
          dataLabel = makeRectLabelInfo(model as RectDataLabel, labelOptions);
        }

        labels.push(dataLabel);
      });

      state.dataLabels.data = [...labels];
    },
  },
};

export default dataLabels;
