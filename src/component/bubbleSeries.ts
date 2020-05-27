import Component from './component';
import { CircleModel } from '@t/components/series';
import { BaseOptions, BubbleSeriesType, CoordinateDataType } from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, Scale, SeriesTheme } from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import {
  getCoordinateDataIndex,
  getCoordinateLabel,
  getCoordinateValue
} from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';

type DrawModels = ClipRectAreaModel | CircleModel;

interface RenderOptions {
  theme: SeriesTheme;
}

const MINIMUM_DETECTING_AREA_RADIUS = 1;

// @TODO: scatter series와 하나가 될 수 있을까?
export default class BubbleSeries extends Component {
  models!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  maxRadius = -1;

  maxValue = -1;

  initialize() {
    this.type = 'series';
    this.name = 'bubbleSeries';
  }

  update(delta: number) {
    if (this.models[0].type === 'clipRectArea') {
      this.models[0].width = this.rect.width * delta;
    }
  }

  setMaxValue(bubbleData: BubbleSeriesType[]) {
    bubbleData.forEach(({ data }) => {
      this.maxValue = Math.max(this.maxValue, ...data.map(({ r }) => r));
    });
  }

  render(chartState: ChartState<BaseOptions>) {
    const { layout, series, scale, theme, categories = [], axes } = chartState;
    if (!series.bubble) {
      throw new Error("There's no bubble data!");
    }

    const { xAxis, yAxis } = axes;

    const bubbleData = series.bubble.data;

    this.rect = layout.plot;

    const xAxisTickSize = this.rect.width / xAxis!.tickCount;
    const yAxisTickSize = this.rect.height / yAxis!.tickCount;

    this.maxRadius = Math.min(xAxisTickSize, yAxisTickSize);

    const renderOptions: RenderOptions = {
      theme: theme.series
    };

    this.setMaxValue(bubbleData);
    const seriesModel = this.renderBubblePointsModel(bubbleData, renderOptions, scale);

    const tooltipModel = this.makeTooltipModel(bubbleData, categories, renderOptions);

    this.models = [this.renderClipRectAreaModel(), ...seriesModel];
    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'circle',
      detectionRadius: 0,
      radius: m.radius + MINIMUM_DETECTING_AREA_RADIUS,
      color: getRGBA(m.color, 0.8),
      style: ['default', 'hover'],
      data: tooltipModel[index]
    }));
  }

  makeTooltipModel(
    bubbleData: BubbleSeriesType[],
    categories: string[],
    renderOptions: RenderOptions
  ) {
    const { theme } = renderOptions;

    return bubbleData.flatMap(({ data, name }, index) => {
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

  renderBubblePointsModel(
    seriesRawData: BubbleSeriesType[],
    renderOptions: RenderOptions,
    scale: Scale
  ): CircleModel[] {
    const { theme } = renderOptions;
    const { colors } = theme;
    const {
      xAxis: { limit: xAxisLimit },
      yAxis: { limit: yAxisLimit }
    } = scale;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const circleModels: CircleModel[] = [];

      data.forEach(datum => {
        const value = getCoordinateValue(datum);
        const label = getCoordinateLabel(datum);

        const xValueRatio = (label - xAxisLimit.min) / (xAxisLimit.max - xAxisLimit.min);
        const yValueRatio = (value - yAxisLimit.min) / (yAxisLimit.max - yAxisLimit.min);

        const x = xValueRatio * this.rect.width;
        const y = (1 - yValueRatio) * this.rect.height;
        const radius = (datum.r / this.maxValue) * this.maxRadius;
        const color = getRGBA(colors[seriesIndex], 0.7);

        circleModels.push({
          x,
          y,
          type: 'circle',
          radius,
          color,
          style: ['default', { strokeStyle: getRGBA(color, 0.3) }],
          seriesIndex
        });
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
