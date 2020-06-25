import { StoreModule } from '@t/store/store';
import { isFunction, isNumber, includes, isBoolean } from '@src/helpers/utils';
import {
  DataLabels as DataLabelOption,
  DataLabelStyle,
  DataLabels,
  DataLabelAnchor,
  DataLabelAlign,
  SeriesDataType,
} from '@t/options';

const ANCHOR_TYPES = ['center', 'start', 'end'];
const ALIGN_TYPES = ['center', 'start', 'end', 'left', 'right', 'top', 'bottom'];

export type DefaultDataLabelOptions = {
  visible: boolean;
  anchor: DataLabelAnchor;
  align: DataLabelAlign;
  offset: number;
  style: Required<DataLabelStyle>;
  stackTotal?: {
    visible: boolean;
    style?: Required<DataLabelStyle>;
  };
};

function getVisible(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): boolean {
  return dataLabelOptions.visible ? dataLabelOptions.visible : defaultOptions.visible;
}

function getAnchor(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): DataLabelAnchor {
  return includes(ANCHOR_TYPES, dataLabelOptions.anchor)
    ? dataLabelOptions.anchor!
    : defaultOptions.anchor;
}

function getAlign(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): DataLabelAlign {
  return includes(ALIGN_TYPES, dataLabelOptions.align)
    ? dataLabelOptions.align!
    : defaultOptions.align;
}

function getOffset(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): number {
  return isNumber(dataLabelOptions.offset) ? dataLabelOptions.offset! : defaultOptions.offset;
}

function getStyle(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): Required<DataLabelStyle> {
  const { font, color, backgroundColor, strokeStyle } = defaultOptions.style;

  return {
    font: dataLabelOptions.style?.font ?? font,
    color: dataLabelOptions.style?.color ?? color,
    backgroundColor: dataLabelOptions.style?.backgroundColor ?? backgroundColor,
    strokeStyle: dataLabelOptions?.style?.strokeStyle ?? strokeStyle,
  };
}

export function getDataLabelsOptions(
  dataLabelOptions: DataLabelOption,
  defaultOptions: DefaultDataLabelOptions
): Required<DataLabels> {
  const visible = getVisible(dataLabelOptions, defaultOptions);
  const anchor = getAnchor(dataLabelOptions, defaultOptions);
  const align = getAlign(dataLabelOptions, defaultOptions);
  const offset = getOffset(dataLabelOptions, defaultOptions);
  const formatter = isFunction(dataLabelOptions.formatter)
    ? dataLabelOptions.formatter!
    : function (value: SeriesDataType): string {
        return String(value) || '';
      };

  const style = getStyle(dataLabelOptions, defaultOptions);
  const stackTotal = {
    visible: isBoolean(dataLabelOptions.stackTotal?.visible)
      ? dataLabelOptions.stackTotal?.visible!
      : defaultOptions.stackTotal?.visible! || visible,
    style: {
      font: dataLabelOptions.stackTotal?.style?.font ?? style.font,
      color: dataLabelOptions.stackTotal?.style?.color ?? style.color,
      backgroundColor: dataLabelOptions.style?.backgroundColor ?? style.backgroundColor,
      strokeStyle: dataLabelOptions?.style?.strokeStyle ?? style.strokeStyle,
    },
  };

  return {
    visible,
    anchor,
    align,
    offset,
    formatter,
    style,
    stackTotal,
  };
}

const dataLabels: StoreModule = {
  name: 'dataLabels',
  state: () => ({
    dataLabels: [],
  }),
  action: {
    appendDataLabels({ state }, dataLabelData) {
      state.dataLabels = [...dataLabelData];
    },
  },
};

export default dataLabels;
