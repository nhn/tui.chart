import { StoreModule } from '@t/store/store';
import { isFunction, isNumber, includes, isBoolean } from '@src/helpers/utils';
import {
  DataLabels as DataLabelOption,
  DataLabelStyle,
  DataLabels,
  DataLabelAnchor,
  DataLabelAlign,
} from '@t/options';

const ANCHOR_TYPES = ['center', 'start', 'end'];
const ALIGN_TYPES = ['center', 'start', 'end', 'left', 'right', 'top', 'bottom'];

export type DefaultDataLabelOptions = {
  visible: boolean;
  anchor: DataLabelAnchor;
  align: DataLabelAlign;
  offset: number;
  style: DataLabelStyle;
  stackTotal?: {
    visible: boolean;
    style?: DataLabelStyle;
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
  const { font, color } = defaultOptions.style;

  return {
    font: dataLabelOptions.style?.font || font!,
    color: dataLabelOptions.style?.color || color!,
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
    : function (value: number | string): string {
        return String(value) || '';
      };

  const style = getStyle(dataLabelOptions, defaultOptions);
  const stackTotal = {
    visible: isBoolean(dataLabelOptions.stackTotal?.visible)
      ? dataLabelOptions.stackTotal?.visible!
      : defaultOptions.stackTotal?.visible!,
    style: {
      font: dataLabelOptions.stackTotal?.style?.font || style.font,
      color: dataLabelOptions.stackTotal?.style?.color || style.color,
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
      state.dataLabels = [...state.dataLabels, ...dataLabelData];
    },
  },
};

export default dataLabels;
