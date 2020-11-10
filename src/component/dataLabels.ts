import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { DataLabelOptions, DataLabelStyle } from '@t/options';
import {
  DataLabelModels,
  DataLabelType,
  DataLabel,
  DataLabelsMap,
  SeriesDataLabels,
  PointDataLabel,
  RadialDataLabel,
  DataLabelSeriesType,
  RectDataLabel,
  LineDataLabel,
} from '@t/components/dataLabels';
import { includes, isUndefined } from '@src/helpers/utils';
import { isModelExistingInRect } from '@src/helpers/coordinate';
import {
  getDataLabelsOptions,
  getDefaultDataLabelsOptions,
  makePointLabelInfo,
  makeSectorLabelInfo,
  makePieSeriesNameLabelInfo,
  makeRectLabelInfo,
  makeLineLabelInfo,
} from '@src/helpers/dataLabels';
import { pickStackOption } from '@src/store/stackSeriesData';

type SeriesDataLabel = {
  data: SeriesDataLabels;
  name: DataLabelSeriesType;
};

function getOptionStyle(type: DataLabelType, options: DataLabelOptions): DataLabelStyle {
  return includes(['pieSeriesName', 'stackTotal'], type) && options[type]
    ? options[type].style
    : options.style;
}

function getLabelInfo(model, labelOptions) {
  const { type } = model;
  const dataLabel: DataLabel[] = [];

  if (type === 'point') {
    dataLabel.push(makePointLabelInfo(model as PointDataLabel, labelOptions));
  } else if (type === 'sector') {
    dataLabel.push(makeSectorLabelInfo(model as RadialDataLabel, labelOptions));

    if (labelOptions.pieSeriesName?.visible) {
      const seriesNameLabel = makePieSeriesNameLabelInfo(model as RadialDataLabel, labelOptions);

      dataLabel.push(seriesNameLabel);
    }
  } else if (type === 'line') {
    dataLabel.push(makeLineLabelInfo(model as LineDataLabel, labelOptions));
  } else {
    dataLabel.push(makeRectLabelInfo(model as RectDataLabel, labelOptions));
  }

  return dataLabel;
}

export default class DataLabels extends Component {
  models!: DataLabelModels;

  drawModels!: DataLabelModels;

  options!: Options;

  dataLabelsMap: DataLabelsMap = {};

  initialize() {
    this.type = 'dataLabels';
    this.name = 'dataLabels';

    this.eventBus.on('renderDataLabels', this.renderSeriesDataLabels);
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }
    this.drawModels = this.getDrawModelsAppliedOpacity(delta);
  }

  render({ layout, options }: ChartState<Options>) {
    this.rect = layout.plot;
    this.options = options;
  }

  renderSeriesDataLabels = (seriesDataLabel: SeriesDataLabel) => {
    this.appendDataLabels(seriesDataLabel);

    this.models = this.renderLabelModel();

    if (!this.drawModels) {
      this.drawModels = this.getDrawModelsAppliedOpacity(0);
    } else {
      this.sync();
    }
  };

  appendDataLabels({ name, data }: SeriesDataLabel) {
    const dataLabelOptions = getDataLabelsOptions(this.options, name);
    const withStack = !!pickStackOption(this.options);
    const labels: DataLabel[] = [];

    data.forEach((model) => {
      const { type, value } = model;
      const labelOptions = getDefaultDataLabelsOptions(dataLabelOptions, type, withStack);
      const disableStackTotal = type === 'stackTotal' && !labelOptions.stackTotal?.visible;

      if (disableStackTotal || isUndefined(value)) {
        return;
      }

      labels.splice(labels.length, 0, ...getLabelInfo(model, labelOptions));
    });

    this.dataLabelsMap[name] = { data: labels, options: dataLabelOptions };
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

  renderLabelModel() {
    return Object.keys(this.dataLabelsMap)
      .map((seriesName) => {
        const { data, options } = this.dataLabelsMap[seriesName];

        return this.makeLabelModel(data, options);
      })
      .reduce<DataLabelModels>(
        (acc, cur) => ({
          series: [...acc.series, ...cur.series],
          total: [...acc.total, ...cur.total],
        }),
        { series: [], total: [] }
      );
  }

  makeLabelModel(dataLabels: DataLabel[], options: DataLabelOptions): DataLabelModels {
    return dataLabels.reduce(
      (acc, dataLabel) => {
        const {
          type,
          x,
          y,
          text,
          textAlign,
          textBaseline,
          defaultColor,
          name,
          hasTextBubble,
          callout,
        } = dataLabel;

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
              hasTextBubble,
              callout,
            },
          ],
        };
      },
      { series: [], total: [] } as DataLabelModels
    );
  }
}
