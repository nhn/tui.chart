import Component from './component';
import { ChartState, Options, Legend as LegendType, Theme } from '@t/store/store';
import { LegendModel, LegendResponderModel, LegendResponderType } from '@t/components/legend';
import {
  CHECKBOX_SIZE,
  ICON_SIZE,
  LEGEND_ITEM_HEIGHT,
  LEGEND_LABEL_FONT,
  margin,
} from '@src/brushes/legend';
import { getTextWidth } from '@src/helpers/calculator';

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
    const defaultX = this.rect.width / 10;
    const defaultY = 20;
    const { iconType, data } = legend;
    const { colors } = theme.series;

    return [
      {
        type: 'legend',
        iconType,
        align: 'right',
        data: data.map((datum, idx) => ({
          ...datum,
          color: colors[idx],
          x: defaultX,
          y: defaultY + LEGEND_ITEM_HEIGHT * idx,
        })),
      },
    ];
  }

  render({ layout, legend, theme }: ChartState<Options>) {
    this.rect = layout.legend;
    this.models = this.renderLegendModel(legend, theme);
    const { data } = this.models[0];
    this.responders = [
      ...data.map((m) => ({
        ...m,
        type: 'checkbox' as LegendResponderType,
        x: m.x + this.rect.x,
        y: m.y + this.rect.y,
      })),
      ...data.map((m) => ({
        ...m,
        type: 'label' as LegendResponderType,
        x: m.x + this.rect.x + CHECKBOX_SIZE + margin.X * 2 + ICON_SIZE,
        y: m.y + this.rect.y,
        width: getTextWidth(m.label, LEGEND_LABEL_FONT),
      })),
    ];
  }
}
