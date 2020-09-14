import Component from './component';
import { ChartState, Options, ScaleData } from '@t/store/store';
import { range } from '@src/helpers/utils';
import { SpectrumLegendModel, SpectrumLegendModels } from '@t/components/spectrumLegend';
import { Align } from '@t/options';
import { TreemapRectResponderModel } from '@t/components/series';
import { isVerticalAlign } from '@src/store/layout';

interface RenderOptions {
  startColor: string;
  endColor: string;
}

export default class SpectrumLegend extends Component {
  models!: SpectrumLegendModels;

  labels: string[] = [];

  align: Align = 'right';

  initialize() {
    this.type = 'spectrumLegend';
    this.name = 'spectrumLegend';
  }

  makeLabels(scale: ScaleData) {
    const { stepCount, limit, stepSize } = scale;
    const minValue = limit.min;

    return range(0, stepCount + 1).reduce<string[]>((acc, cur) => {
      return [...acc, String(minValue + stepSize * cur)];
    }, []);
  }

  renderSpectrumLegendModel(renderOptions: RenderOptions): SpectrumLegendModel[] {
    const { width, height } = this.rect;
    const { startColor, endColor } = renderOptions;

    return [
      {
        type: 'spectrumLegend',
        width,
        height,
        x: 0,
        y: 0,
        labels: this.labels,
        align: this.align,
        startColor,
        endColor,
        verticalAlign: isVerticalAlign(this.align),
      },
    ];
  }

  renderSpectrumTooltip = ([responderData]: TreemapRectResponderModel[]) => {
    if (responderData) {
      const { colorValue, color } = responderData;
      const colorRatio = responderData.colorRatio!;
      const { width, height } = this.rect;

      this.models.tooltip = [
        {
          type: 'spectrumTooltip',
          width,
          height,
          x: 0,
          y: 0,
          labels: this.labels,
          align: this.align,
          colorRatio,
          color,
          text: String(colorValue),
          verticalAlign: isVerticalAlign(this.align),
        },
      ];
    } else {
      this.models.tooltip = [];
    }
  };

  render({ layout, legend, treemapScale, theme }: ChartState<Options>) {
    if (!legend.visible) {
      return;
    }

    this.rect = layout.legend;
    this.labels = this.makeLabels(treemapScale);
    this.align = legend.align;

    const { startColor, endColor } = theme.series;

    const renderOptions: RenderOptions = { startColor, endColor };
    this.models = { legend: this.renderSpectrumLegendModel(renderOptions), tooltip: [] };

    this.eventBus.on('renderSpectrumTooltip', this.renderSpectrumTooltip);
  }
}
