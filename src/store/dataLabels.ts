import { StoreModule } from '@t/store/store';
import { isFunction, includes } from '@src/helpers/utils';
import { DataLabels, DataLabelStyle, DataLabelAnchor, SeriesDataType, Point } from '@t/options';
import { PointModel, RectModel } from '@t/components/series';
import { DataLabel, DataLabelOption } from '@t/components/dataLabels';
import { strokeLabelStyle, labelStyle } from '@src/brushes/label';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';

type LabelPosition = {
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
};
type DataLabelType = 'point' | 'rect' | 'box' | 'stack';
type PointDataLabel = PointModel & {
  type: 'point';
};
export type RectDirection = 'top' | 'bottom' | 'left' | 'right';
export type RectDataLabel = RectModel & {
  direction: RectDirection;
  padding: number;
  hoverThickness: number;
  plot: {
    x: number;
    y: number;
    size: number;
  };
};
export type StackDataLabel = Omit<RectDataLabel, 'type'> & {
  type: 'stack';
  isStack: boolean;
  isTotal: boolean;
};

export type DefaultDataLabelOptions = {
  visible: boolean;
  anchor: DataLabelAnchor;
  offsetX: number;
  offsetY: number;
  style: Required<DataLabelStyle>;
  stackTotal?: {
    visible: boolean;
    style?: Required<DataLabelStyle>;
  };
};

function getDefaultOptions(type: DataLabelType) {
  const style = {
    font: labelStyle['default'].font,
    color: labelStyle['default'].fillStyle,
    textStrokeColor: strokeLabelStyle.stroke.strokeStyle,
  };

  return {
    point: {
      anchor: 'center',
      style,
    } as DefaultDataLabelOptions,
    rect: {
      anchor: 'auto',
      style,
    } as DefaultDataLabelOptions,
  }[type];
}

function getAnchor(
  dataLabelOptions: DataLabels,
  defaultOptions: DefaultDataLabelOptions
): DataLabelAnchor {
  return includes(['center', 'start', 'end', 'auto'], dataLabelOptions.anchor)
    ? dataLabelOptions.anchor!
    : defaultOptions.anchor;
}

function getStyle(
  dataLabelOptions: DataLabels,
  defaultOptions: DefaultDataLabelOptions
): Required<DataLabelStyle> {
  const { font, color, textStrokeColor } = defaultOptions.style;

  return {
    font: dataLabelOptions.style?.font ?? font,
    color: dataLabelOptions.style?.color ?? color,
    textStrokeColor: dataLabelOptions?.style?.textStrokeColor ?? textStrokeColor,
  };
}

export function getDataLabelsOptions(
  dataLabelOptions: DataLabels,
  type: DataLabelType
): DataLabelOption {
  const defaultOptions = getDefaultOptions(type);
  const anchor = getAnchor(dataLabelOptions, defaultOptions);
  const { offsetX = 0, offsetY = 0 } = dataLabelOptions;
  const formatter = isFunction(dataLabelOptions.formatter)
    ? dataLabelOptions.formatter!
    : function (value: SeriesDataType): string {
        return String(value) || '';
      };
  const style = getStyle(dataLabelOptions, defaultOptions);

  return { anchor, offsetX, offsetY, formatter, style };
}

function makePointLabelInfo(point: PointDataLabel, dataLabelOptions: DataLabelOption): DataLabel {
  const { anchor, offsetX = 0, offsetY = 0, formatter, style } = dataLabelOptions;

  let posX = point.x;
  let posY = point.y;

  const textAlign = 'center';
  let textBaseline: CanvasTextBaseline = 'middle';

  if (anchor === 'end') {
    textBaseline = 'bottom';
  } else if (anchor === 'start') {
    textBaseline = 'top';
  }

  posX += offsetX;
  posY += offsetY;

  return {
    x: posX,
    y: posY,
    text: formatter!(point.value!),
    textAlign,
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
        textAlign = 'start';
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
    textAlign = 'end';

    if (direction === 'left' && width >= textWidth) {
      x = rect.x;
      textAlign = 'start';
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
  const { value, direction } = rect;
  const { formatter, style } = dataLabelOptions;
  const horizontal = isHorizontal(direction);
  const labelPosition = horizontal
    ? makeHorizontalRectLabelInfo(rect, dataLabelOptions)
    : makeVerticalRectLabelInfo(rect, dataLabelOptions);

  return {
    ...labelPosition,
    text: formatter!(value!),
    style,
  };
}

const dataLabels: StoreModule = {
  name: 'dataLabels',
  state: () => ({
    dataLabels: [],
  }),
  action: {
    appendDataLabels({ state }, dataLabelData: Array<PointDataLabel | RectDataLabel>) {
      const { options } = state;
      const dataLabelOptions = options.series?.dataLabels!;

      const labels = dataLabelData.map((model) => {
        const { type } = model;
        const labelOptions = getDataLabelsOptions(dataLabelOptions, type);

        return type === 'point'
          ? makePointLabelInfo(model as PointDataLabel, labelOptions)
          : makeRectLabelInfo(model as RectDataLabel, labelOptions);
      });

      state.dataLabels = [...labels];
    },
  },
};

export default dataLabels;
