import Component from './component';
import {
  ChartState,
  Options,
  Legend as LegendType,
  LegendIconType,
  LegendDataList,
} from '@t/store/store';
import { LegendData, LegendModel } from '@t/components/legend';
import {
  getLegendItemHeight,
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_ITEM_MARGIN_X,
  LEGEND_MARGIN_X,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';
import { isVerticalAlign, padding } from '@src/store/layout';
import { sum } from '@src/helpers/utils';
import { RectResponderModel } from '@t/components/series';
import { LegendTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';

export default class Legend extends Component {
  models!: LegendModel[];

  responders!: RectResponderModel[];

  theme!: Required<LegendTheme>;

  activatedResponders: RectResponderModel[] = [];

  seriesColorMap: Record<string, string> = {};

  seriesIconTypeMap: Record<string, string> = {};

  onClick({ responders }: { responders: RectResponderModel[] }) {
    if (responders.length) {
      const { data } = responders[0];
      if (data?.name === 'checkbox') {
        this.eventBus.emit('clickLegendCheckbox', responders);
      } else {
        this.eventBus.emit('clickLegendLabel', responders);
      }
    }
  }

  onClickCheckbox = (responders) => {
    const { label, checked } = responders[0];

    this.store.dispatch('setAllLegendActiveState', true);
    this.store.dispatch('setLegendCheckedState', { name: label, checked: !checked });

    if (checked) {
      this.store.dispatch('disableSeries', label);
    } else {
      this.store.dispatch('enableSeries', label);
    }

    this.eventBus.emit('needDraw');
  };

  onClickLabel = (responders) => {
    const { label } = responders[0];
    this.eventBus.emit('resetSelectedSeries');

    if (this.activatedResponders.length && this.activatedResponders[0].label === label) {
      this.store.dispatch('setAllLegendActiveState', true);
      this.activatedResponders = [];
    } else {
      this.store.dispatch('setAllLegendActiveState', false);
      this.store.dispatch('setLegendActiveState', { name: label, active: true });
      this.activatedResponders = responders;
    }

    this.eventBus.emit('needDraw');
  };

  initialize() {
    this.type = 'legend';
    this.name = 'legend';
    this.eventBus.on('clickLegendCheckbox', this.onClickCheckbox);
    this.eventBus.on('clickLegendLabel', this.onClickLabel);
  }

  initColorAndIconTypeMap(legendData: LegendDataList) {
    this.seriesColorMap = {};
    this.seriesIconTypeMap = {};

    legendData.forEach(({ label, color, iconType }) => {
      this.seriesColorMap[label] = color;
      this.seriesIconTypeMap[label] = iconType;
    });
  }

  renderLegendModel(legend: LegendType): LegendModel[] {
    const defaultX = 0;
    const { data, showCheckbox, align, useScatterChartIcon } = legend;
    const verticalAlign = isVerticalAlign(align);
    const legendWidths = data.map(({ width }) => width);
    const itemHeight = getLegendItemHeight(this.theme.label.fontSize!);

    return [
      {
        type: 'legend',
        align,
        showCheckbox,
        data: data.map((datum, idx) => {
          const xOffset = sum(legendWidths.slice(0, idx)) + LEGEND_ITEM_MARGIN_X * idx;

          return {
            ...datum,
            iconType: (this.seriesIconTypeMap[datum.label] ?? datum.iconType) as LegendIconType,
            color: this.seriesColorMap[datum.label],
            x: verticalAlign ? defaultX + xOffset : defaultX,
            y: verticalAlign ? padding.Y : padding.Y + itemHeight * idx,
            useScatterChartIcon,
          };
        }),
        ...this.theme.label,
      },
    ];
  }

  makeCheckboxResponder(data: LegendData[], showCheckbox: boolean): RectResponderModel[] {
    return showCheckbox
      ? data.map((m) => ({
          ...m,
          type: 'rect',
          x: m.x,
          y: m.y,
          width: LEGEND_CHECKBOX_SIZE,
          height: LEGEND_CHECKBOX_SIZE,
          data: { name: 'checkbox' },
        }))
      : [];
  }

  makeLabelResponder(data: LegendData[], showCheckbox: boolean): RectResponderModel[] {
    const font = getTitleFontString(this.theme.label);

    return data.map((m) => ({
      ...m,
      type: 'rect',
      x:
        m.x +
        (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
        LEGEND_ICON_SIZE +
        LEGEND_MARGIN_X,
      y: m.y,
      width: getTextWidth(m.label, font),
      data: { name: 'label' },
      height: LEGEND_CHECKBOX_SIZE,
    }));
  }

  render({ layout, legend, series, nestedPieSeries, theme }: ChartState<Options>) {
    this.isShow = legend.visible;

    if (!this.isShow) {
      return;
    }

    // @TODO: stack 일 떄 라벨 순서 역순으로(스택이 쌓인 순서대로) 되어야

    const { showCheckbox, data: legendData } = legend;
    this.rect = layout.legend;
    this.theme = theme.legend as Required<LegendTheme>;

    this.initColorAndIconTypeMap(legendData);
    this.models = this.renderLegendModel(legend);

    const { data } = this.models[0];
    const checkboxResponder = this.makeCheckboxResponder(data, showCheckbox);
    const labelResponder = this.makeLabelResponder(data, showCheckbox);

    this.responders = [...checkboxResponder, ...labelResponder];
  }
}
