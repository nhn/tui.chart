import Component from './component';
import { ChartState, Options, Legend as LegendType, Theme } from '@t/store/store';
import { LegendModel, LegendResponderModel, LegendResponderType } from '@t/components/legend';
import {
  LEGEND_CHECKBOX_SIZE,
  LEGEND_ICON_SIZE,
  LEGEND_ITEM_MARGIN_X,
  LEGEND_LABEL_FONT,
  LEGEND_MARGIN_X,
  LEGEND_ITEM_HEIGHT,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';
import { isVerticalAlign } from '@src/store/layout';
import { sum } from '@src/helpers/utils';

export default class Legend extends Component {
  models!: LegendModel[];

  responders!: LegendResponderModel[];

  activatedResponders: LegendResponderModel[] = [];

  onClick({ responders }: { responders: LegendResponderModel[] }) {
    if (responders.length) {
      const { type } = responders[0];
      if (type === 'checkbox') {
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

  renderLegendModel(legend: LegendType, theme: Theme): LegendModel[] {
    const defaultX = 0;
    const defaultY = 20;
    const { iconType, data, showCheckbox, align } = legend;
    const { colors } = theme.series;
    const verticalAlign = isVerticalAlign(align);
    const legendWidths = data.map(({ width }) => width);

    return [
      {
        type: 'legend',
        iconType,
        align,
        showCheckbox,
        data: data.map((datum, idx) => {
          const xOffset = sum(legendWidths.slice(0, idx)) + LEGEND_ITEM_MARGIN_X * idx;

          return {
            ...datum,
            color: colors[idx],
            x: verticalAlign ? defaultX + xOffset : defaultX,
            y: verticalAlign ? defaultY : defaultY + LEGEND_ITEM_HEIGHT * idx,
          };
        }),
      },
    ];
  }

  render({ layout, legend, theme }: ChartState<Options>) {
    if (!legend.visible) {
      return;
    }

    const { showCheckbox } = legend;
    this.rect = layout.legend;
    this.models = this.renderLegendModel(legend, theme);
    const { data } = this.models[0];
    const checkboxResponder = showCheckbox
      ? data.map((m) => ({
          ...m,
          type: 'checkbox' as LegendResponderType,
          x: m.x + this.rect.x,
          y: m.y + this.rect.y,
        }))
      : [];
    const labelResponder = data.map((m) => ({
      ...m,
      type: 'label' as LegendResponderType,
      x:
        m.x +
        this.rect.x +
        (showCheckbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
        LEGEND_ICON_SIZE +
        LEGEND_MARGIN_X,
      y: m.y + this.rect.y,
      width: getTextWidth(m.label, LEGEND_LABEL_FONT),
    }));

    this.responders = [...checkboxResponder, ...labelResponder];
  }
}
