import Component from './component';
import { LabelModel } from '@t/components/axis';
import { isBoolean, includes, isNumber, isFunction } from '@src/helpers/utils';

import { ChartState, Options } from '@t/store/store';
import { DataLabels as DataLabelOption, DataLabelStyle } from '@t/options';
import { RectModel, LinePointsModel } from '@t/components/series';
import { getTextWidth, getTextHeight } from '@src/helpers/calculator';
import { labelStyle } from '@src/brushes/basic';

const ANCHOR_TYPES = ['center', 'start', 'end'];
const ALIGN_TYPES = ['center', 'start', 'end', 'left', 'right', 'top', 'bottom'];

type RenderOptions = DataLabelOption;
type SeriesModel = RectModel[] | LinePointsModel[];

export default class DataLabels extends Component {
  models!: LabelModel[];

  drawModels!: LabelModel[];

  renderOptions!: RenderOptions;

  initialize({ name }) {
    this.type = 'dataLabels';
    this.name = name;
    this.eventBus.on('drawDataLabels', this.onDrawDataLabels);
  }

  onDrawDataLabels = ({ seriesModels, seriesRect }) => {
    this.rect = seriesRect;
    this.models = this.renderLabelModel(seriesModels);

    if (!this.drawModels) {
      this.drawModels = this.models.map((m) => {
        const drawModel = { ...m };

        if (this.name === 'bar') {
          drawModel.x = 0;
        } else if (this.name === 'column') {
          drawModel.y = this.rect.height;
        }

        return drawModel;
      });
    }
  };

  render({ layout, options }: ChartState<Options>) {
    this.rect = layout.plot;
    this.renderOptions = this.makeRenderOptions(options.series?.dataLabels);
  }

  // eslint-disable-next-line complexity
  makeRenderOptions(dataLabelOptions?: DataLabelOption): RenderOptions {
    if (!dataLabelOptions) {
      return {
        visible: false,
      } as RenderOptions;
    }
    const visible = isBoolean(dataLabelOptions.visible) ? dataLabelOptions.visible : false;
    const anchor = includes(ANCHOR_TYPES, dataLabelOptions.anchor)
      ? dataLabelOptions.anchor!
      : 'end';
    const align = includes(ALIGN_TYPES, dataLabelOptions.align) ? dataLabelOptions.align! : 'end';
    const offset = isNumber(dataLabelOptions.offset) ? dataLabelOptions.offset! : 0;
    const rotation = isNumber(dataLabelOptions.rotation) ? dataLabelOptions.rotation! : 0;
    const formatter = isFunction(dataLabelOptions.formatter)
      ? dataLabelOptions.formatter!
      : function (value: number | string): string {
          return String(value) || '';
        };

    const { font, fillStyle } = labelStyle['default'];
    const style: Required<DataLabelStyle> = {
      font: dataLabelOptions.style?.font || font,
      color: dataLabelOptions.style?.color || fillStyle,
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

  renderLabelModel(seriesModel): LabelModel[] {
    if (!this.renderOptions.visible) {
      return [];
    }

    return seriesModel.map((data) => {
      const { x, y, text, style, angle } = this.getLabelInfo(data);

      return {
        type: 'label',
        text,
        x,
        y,
        style: ['default', style],
        // angle,
      } as LabelModel;
    });
  }

  getLabelInfo(data) {
    let result;

    if (this.name === 'bar') {
      result = this.makeBarLabelInfo(data);
    } else if (this.name === 'column') {
      result = this.makeColumnLabelInfo(data);
    }

    return result;
  }

  makeBarLabelInfo(data) {
    const {
      anchor,
      align,
      offset,
      style: { font, color },
      formatter,
      rotation,
    } = this.renderOptions as Required<DataLabelOption>;

    const { width, height, value } = data;
    const text = formatter(value);
    let { x, y } = data;
    let textAlign = 'center';
    const textBaseline = 'middle';
    const angle = (rotation * Math.PI) / 180;
    let style = { font, fillStyle: color };

    y = data.y + height / 2;

    if (anchor === 'start') {
      x = data.x;
      textAlign = 'start';
    } else if (anchor === 'end') {
      x = data.x + width;
      textAlign = 'center';
    } else {
      x = data.x + width / 2;
      textAlign = 'center';
    }

    if (includes(['end', 'right'], align)) {
      textAlign = 'start';
      x += offset;
    } else if (includes(['start', 'left'], align)) {
      textAlign = 'end';
      x -= offset;
    }

    // adjust the position automatically, when outside and overflowing
    if (
      anchor === 'end' &&
      includes(['end', 'right'], align) &&
      this.rect.outsideSize &&
      this.rect.outsideSize < x + getTextWidth(text, font!)
    ) {
      x = data.x + width - offset;
      textAlign = 'end';
    }

    style = Object.assign(style, { textAlign, textBaseline });

    return {
      x,
      y,
      text,
      style,
      angle,
    };
  }

  makeColumnLabelInfo(data) {
    const {
      anchor,
      align,
      offset,
      style: { font, color },
      formatter,
      rotation,
    } = this.renderOptions as Required<DataLabelOption>;

    const { width, height, value } = data;
    const text = formatter(value);
    let { x, y } = data;
    const textAlign = 'center';
    let textBaseline = 'middle';
    const fillStyle = isFunction(color) ? color(data) : color;
    const angle = (rotation * Math.PI) / 180;

    let style = { font, fillStyle };

    x = data.x + width / 2;

    if (anchor === 'start') {
      y = data.y + data.height;
    } else if (anchor === 'end') {
      y = data.y;
    } else {
      y = data.y + data.height / 2;
    }

    if (includes(['top', 'end'], align)) {
      y -= offset;
      textBaseline = 'bottom';
    } else if (includes(['bottom', 'start'], align)) {
      y += offset;
      textBaseline = 'top';
    }

    // adjust the position automatically, when outside and overflowing
    if (
      anchor === 'end' &&
      includes(['end', 'top'], align) &&
      this.rect.outsideSize &&
      this.rect.outsideSize < height + getTextHeight(font!)
    ) {
      y = data.y + offset;
      textBaseline = 'top';
    }

    style = Object.assign(style, { textAlign, textBaseline });

    return {
      x,
      y,
      text,
      style,
      angle,
    };
  }
}
