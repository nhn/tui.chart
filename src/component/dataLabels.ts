import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { DataLabels as DataLabelOptions, DataLabelStyle } from '@t/options';
import { DataLabel, DataLabelModels, DataLabelType } from '@t/components/dataLabels';
import { includes } from '@src/helpers/utils';
import { isModelExistingInRect } from '@src/helpers/coordinate';

function getOptionStyle(type: DataLabelType, options: DataLabelOptions): DataLabelStyle {
  return includes(['pieSeriesName', 'stackTotal'], type) && options[type]
    ? options[type].style
    : options.style;
}

export default class DataLabels extends Component {
  models!: DataLabelModels;

  drawModels!: DataLabelModels;

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }
    this.drawModels = this.getDrawModelsAppliedOpacity(delta);
  }

  render({ layout, dataLabels, options }: ChartState<Options>) {
    if (!dataLabels?.visible) {
      return;
    }

    this.rect = layout.plot;
    this.models = this.renderLabelModel(dataLabels.data, options?.series?.dataLabels ?? {});

    if (!this.drawModels) {
      this.drawModels = this.getDrawModelsAppliedOpacity(0);
    }
  }

  private getDrawModelsAppliedOpacity(opacity: number) {
    return Object.keys(this.models).reduce(
      (acc, key) => ({
        ...acc,
        [key]: this.models[key].map((m) => ({ ...m, opacity })),
      }),
      { series: [], total: [] } as DataLabelModels
    );
  }

  renderLabelModel(dataLabels: DataLabel[], options: DataLabelOptions): DataLabelModels {
    return dataLabels.reduce(
      (acc, dataLabel) => {
        const { type, x, y, text, textAlign, textBaseline, defaultColor, name } = dataLabel;

        if (!isModelExistingInRect(this.rect, { x, y })) {
          return acc;
        }

        const modelName = type === 'stackTotal' ? 'total' : 'series';

        return {
          ...acc,
          [modelName]: [
            ...(acc[modelName] ?? []),
            {
              type: 'dataLabel',
              dataLabelType: type,
              text,
              x,
              y: y + 1,
              textAlign,
              textBaseline,
              defaultColor,
              style: getOptionStyle(type, options),
              opacity: 1,
              name,
            },
          ],
        };
      },
      { series: [], total: [] } as DataLabelModels
    );
  }
}
