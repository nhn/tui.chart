import Component from './component';
import { ChartState, Options, CircularAxisData } from '@t/store/store';
import { AxisType } from '@src/component/axis';
import { AxisTitleOption, Rect } from '@t/options';
import { includes } from '@src/helpers/utils';
import { FontTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { getAxisTheme } from '@src/helpers/axes';
import { LabelModel } from '@t/components/axis';
import { AxisType } from '@src/component/axis';

export default class AxisTitle extends Component {
  models!: LabelModel[];

  isYAxis!: boolean;

  isCircularAxis!: boolean;

  theme!: Required<FontTheme>;

  initialize({ name }: { name: AxisType | 'circularAxis' }) {
    this.type = 'axisTitle';
    this.name = name;
    this.isYAxis = includes([AxisType.Y, AxisType.SECONDARY_Y], name);
    this.isCircularAxis = this.name === 'circularAxis';
  }

  getTitlePosition(offsetX: number, offsetY: number) {
    if (this.isCircularAxis) {
      return [this.rect.width / 2 + offsetX, this.rect.height / 2 + offsetY];
    }

    return this.isYAxis
      ? [this.name === AxisType.Y ? offsetX : this.rect.width + offsetX, offsetY]
      : [this.rect.width + offsetX, offsetY];
  }

  renderAxisTitle(option: Required<AxisTitleOption>, textAlign: CanvasTextAlign): LabelModel[] {
    const { text, offsetX, offsetY } = option;
    const [x, y] = this.getTitlePosition(offsetX, offsetY);
    const font = getTitleFontString(this.theme);
    const fillStyle = this.theme.color;

    return [
      {
        type: 'label',
        text,
        x,
        y,
        style: ['axisTitle', { textAlign, fillStyle, font }],
      },
    ];
  }

  getTextAlign(hasCenterYAxis = false) {
    let result: CanvasTextAlign = 'right';

    if (this.name === AxisType.Y) {
      result = hasCenterYAxis ? 'center' : 'left';
    } else if (this.isCircularAxis) {
      result = 'center';
    }

    return result;
  }

  getCircularAxisTitleRect(
    option: Required<AxisTitleOption>,
    plotRect: Rect,
    circularAxis: CircularAxisData
  ) {
    const { x, y } = plotRect;
    const { centerX, centerY, outerRadius, axisSize } = circularAxis;
    const { offsetY } = option;

    return {
      x: centerX + x - axisSize / 2,
      y: centerY + y - outerRadius / 2,
      width: axisSize,
      height: this.theme.fontSize + offsetY,
    };
  }

  render({ axes, radialAxes, layout, theme }: ChartState<Options>) {
    const titleOption = this.isCircularAxis ? radialAxes[this.name]?.title : axes[this.name]?.title;

    this.isShow = !!titleOption;

    if (!this.isShow) {
      return;
    }

    this.theme = getAxisTheme(theme, this.name).title as Required<FontTheme>;
    this.rect = layout[`${this.name}Title`];
    this.models = this.renderAxisTitle(titleOption, this.getTextAlign(!!axes?.centerYAxis));
  }
}
