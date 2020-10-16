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

  align!: Align;

  initialize() {
    this.type = 'spectrumLegend';
    this.name = 'spectrumLegend';
  }

  makeLabels(scale: ScaleData) {
    const { stepCount, limit, stepSize } = scale;
    const minValue = limit.min;

    return range(0, stepCount + 1).reduce<string[]>((labels, value) => {
      return [...labels, String(minValue + stepSize * value)];
    }, []);
  }

  renderSpectrumLegendModel(renderOptions: RenderOptions): SpectrumLegendModel[] {
    const { labels, align } = this;
    const { width, height } = this.rect;
    const { startColor, endColor } = renderOptions;

    return [
      {
        type: 'spectrumLegend',
        width,
        height,
        x: 0,
        y: 0,
        labels,
        align,
        startColor,
        endColor,
        verticalAlign: isVerticalAlign(this.align),
      },
    ];
  }

  renderSpectrumTooltip = ([responderData]: TreemapRectResponderModel[]) => {
    if (responderData) {
      const { labels, align } = this;
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
          labels,
          align,
          colorRatio,
          color,
          text: String(colorValue),
          verticalAlign: isVerticalAlign(align),
        },
      ];
    } else {
      this.models.tooltip = [];
    }
  };

  render({ layout, legend, colorValueScale, theme }: ChartState<Options>) {
    if (!legend.visible) {
      return;
    }

    this.rect = layout.legend;
    this.align = legend.align;
    this.labels = this.makeLabels(colorValueScale);
    const seriesTheme = theme.series?.heatmap! || theme.series?.treemap!;

    const { startColor, endColor } = seriesTheme;
    const renderOptions: RenderOptions = { startColor, endColor };
    this.models = { legend: this.renderSpectrumLegendModel(renderOptions), tooltip: [] };

    this.eventBus.on('renderSpectrumTooltip', this.renderSpectrumTooltip);
  }
}
