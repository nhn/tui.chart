import { DataLabels, DataLabelStyle } from '@t/options';
import { isBoolean, includes, isNumber, isFunction } from '@src/helpers/utils';
import { LabelModel } from '@t/components/axis';
import { RectModel, LinePointsModel } from '@t/components/series';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';

const ANCHOR_TYPES = ['center', 'start', 'end'];
const ALIGN_TYPES = ['center', 'start', 'end', 'left', 'right', 'top', 'bottom'];
const VALID_SERIES = ['bar', 'column', 'line', 'pie'];

type RenderOptions = Required<DataLabels>;
type SeriesModel = RectModel[] | LinePointsModel[];

export default class DataLabel {
  seriesName: string;

  seriesModel: any = [];

  renderOptions: RenderOptions;

  validSeriesLabel = false;

  withoutSize = 0;

  // eslint-disable-next-line complexity
  makeRenderOptions(dataLabelOptions: DataLabels): RenderOptions {
    const visible = isBoolean(dataLabelOptions.visible) ? dataLabelOptions.visible : false;
    const anchor = includes(ANCHOR_TYPES, dataLabelOptions.anchor)
      ? dataLabelOptions.anchor!
      : 'center';
    const align = includes(ALIGN_TYPES, dataLabelOptions.align)
      ? dataLabelOptions.align!
      : 'center';
    const offset = isNumber(dataLabelOptions.offset) ? dataLabelOptions.offset! : 0;
    const rotation = isNumber(dataLabelOptions.rotation) ? dataLabelOptions.rotation! : 0;
    const formatter = isFunction(dataLabelOptions.formatter)
      ? dataLabelOptions.formatter!
      : function (value: number): string {
          return String(value) || '';
        };

    // TODO: set default value from Axis Label Style
    const style: Required<DataLabelStyle> = {
      font: dataLabelOptions.style?.font || 'normal 11px Arial',
      color: dataLabelOptions.style?.color || '#333333',
    };

    const stackTotal = {
      visible: isBoolean(dataLabelOptions.stackTotal?.visible)
        ? dataLabelOptions.stackTotal?.visible!
        : false,
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
      rotation,
      formatter,
      style,
      stackTotal,
    };
  }

  constructor(
    seriesName: string,
    seriesModel: SeriesModel,
    dataLabelOptions: DataLabels,
    withoutSize = 0
  ) {
    this.seriesName = seriesName;
    this.seriesModel = seriesModel;
    this.renderOptions = this.makeRenderOptions(dataLabelOptions);
    this.withoutSize = withoutSize;
    this.validSeriesLabel = includes(VALID_SERIES, seriesName) && this.renderOptions.visible;
  }

  get models(): LabelModel[] {
    return this.validSeriesLabel ? this.renderLabelModel() : [];
  }

  renderLabelModel(): LabelModel[] {
    const {
      offset,
      style: { font },
      formatter,
    } = this.renderOptions;

    return this.seriesModel.map((data) => {
      const { value, width, height } = data;
      const label = formatter(value);
      let { x, y } = data;
      let textAlign = 'center';
      let textBaseline = 'middle';

      let style = { font };

      // this.isBar && inside - START
      if (this.seriesName === 'bar') {
        y = data.y + height / 2;

        x = data.x + width;
        textAlign = 'end';

        x = data.x + width / 2;
        textAlign = 'center';

        x = data.x;
        textAlign = 'start';
        //  this.isBar && inside - END

        // this.isBar && outside - START
        x = data.x + width + offset;
        textAlign = 'left';
        //  this.isBar && outside - END

        // auto - START 넘어갔을 때 auto 조절
        if (this.withoutSize < x + getTextWidth(value, label)) {
          x = data.x + width - offset;
          textAlign = 'end';
        }
        // auto - END

        style = Object.assign(style, { textAlign, textBaseline: 'middle' });
      } else if (this.seriesName === 'column') {
        x = data.x + width / 2;
        textAlign = 'center';

        // inside - START
        y = data.y + offset;
        textBaseline = 'top';
        // inside - END

        // outside - START
        y = data.y - offset;
        textBaseline = 'bottom';
        // outside - END

        // auto - START 넘어갔을 때 auto 조절
        if (this.withoutSize < height + getTextHeight(label)) {
          y = data.y + offset;
          textBaseline = 'top';
        }
        // auto - END

        style = Object.assign(style, { textAlign: 'center', textBaseline });
      }

      return {
        type: 'label',
        text: label,
        x,
        y,
        style: ['default', style],
      } as LabelModel;
    });
  }

  getTextAlign() {
    const { anchor } = this.renderOptions;
    const result = anchor;

    return result;
  }
}
