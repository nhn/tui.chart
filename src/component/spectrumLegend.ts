import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { LegendModel } from '@t/components/legend';

export default class SpectrumLegend extends Component {
  models!: LegendModel[];

  initialize() {
    this.type = 'spectrumLegend';
    this.name = 'spectrumLegend';
  }

  render({ layout, legend }: ChartState<Options>) {
    if (!legend.visible) {
      return;
    }

    this.rect = layout.legend;
    this.models = [
      { type: 'rect', x: 0, y: 0, width: this.rect.width, height: this.rect.height, color: '#ccc' },
    ];
  }
}
