import Component from './component';
import { CircleModel, CircleStyle, StyleProp } from '@t/components/series';
import { CoordinateDataType, ScatterChartOptions, ScatterSeriesType } from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, SeriesTheme, ValueEdge } from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { isString } from '@src/helpers/utils';

type DrawModels = ClipRectAreaModel | CircleModel;

interface RenderOptions {
  theme: SeriesTheme;
}

export default class ScatterSeries extends Component {
  models!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'scatterSeries';
  }

  update(delta: number) {
    if (this.models[0].type === 'clipRectArea') {
      this.models[0].width = this.rect.width * delta;
    }
  }

  getColorFromStyleObj(styleObj: StyleProp<CircleStyle>) {
    let color;

    styleObj.forEach(style => {
      if (!isString(style)) {
        color = style.color;
      }
    });

    return color;
  }

  render(chartState: ChartState<ScatterChartOptions>) {
    const { layout, series, scale, theme, categories = [] } = chartState;
    if (!series.scatter) {
      throw new Error("There's no scatter data!");
    }

    const scatterData = series.scatter.data;

    this.rect = layout.plot;

    const { yAxis } = scale;

    const tickDistance = this.rect.width / categories.length;

    const renderOptions: RenderOptions = {
      theme: theme.series
    };

    const seriesModel = this.renderScatterPointsModel(
      scatterData,
      yAxis.limit,
      tickDistance,
      renderOptions,
      categories
    );

    const tooltipModel = this.makeTooltipModel(scatterData, categories, renderOptions);

    this.models = [this.renderClipRectAreaModel(), ...seriesModel];
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionRadius: 0,
      radius: 7,
      style: ['default', 'hover', { color: getRGBA(this.getColorFromStyleObj(m.style), 1) }],
      data: tooltipModel[index]
    }));
  }

  makeTooltipModel(
    scatterData: ScatterSeriesType[],
    categories: string[],
    renderOptions: RenderOptions
  ) {
    const { theme } = renderOptions;

    return scatterData.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: CoordinateDataType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.colors[index],
          value: getCoordinateValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)]
        });
      });

      return tooltipData;
    });
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: 0,
      height: this.rect.height
    };
  }

  renderScatterPointsModel(
    seriesRawData: ScatterSeriesType[],
    limit: ValueEdge,
    tickDistance: number,
    renderOptions: RenderOptions,
    categories: string[]
  ): CircleModel[] {
    const { theme } = renderOptions;
    const { colors } = theme;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const circleModels: CircleModel[] = [];
      const style: StyleProp<CircleStyle> = [
        'default',
        { color: getRGBA(colors[seriesIndex], 0.9) }
      ];

      data.forEach((datum, idx) => {
        const value = getCoordinateValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);

        const valueRatio = (value - limit.min) / (limit.max - limit.min);

        const x = tickDistance * dataIndex;
        const y = (1 - valueRatio) * this.rect.height;

        circleModels.push({ x, y, type: 'circle', radius: 7, style });
      });

      return circleModels;
    });
  }

  onMousemove({ responders }) {
    this.activatedResponders.forEach(responder => {
      const index = this.models.findIndex(model => model === responder);
      this.models.splice(index, 1);
    });

    responders.forEach(responder => {
      this.models.push(responder);
    });

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
