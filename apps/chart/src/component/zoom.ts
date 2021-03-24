import Component from './component';
import { AxisData, ChartState, LabelAxisData, Options, Scale, Series } from '@t/store/store';
import { RectResponderModel, RectModel } from '@t/components/series';
import { isNull, range } from '@src/helpers/utils';
import { sortNumber } from '@src/helpers/utils';
import { ZoomModels } from '@t/components/zoom';
import { AreaSeriesType, CoordinateDataType, LineSeriesType, Point } from '@t/options';
import { makeObservableObjectToNormal } from '@src/store/reactive';
import {
  getCoordinateDataIndex,
  getCoordinateXValue,
  isCoordinateSeries,
} from '@src/helpers/coordinate';
import { getXPosition } from '@src/helpers/calculator';
import {
  makeRectResponderModelForCoordinateType,
  RectResponderInfoForCoordinateType,
} from '@src/helpers/responders';

const DRAG_MIN_WIDTH = 15;

type ZoomableSeries = Pick<Series, 'line' | 'area'>;

export default class Zoom extends Component {
  models: ZoomModels = { selectionArea: [] };

  responders!: RectResponderModel[];

  startIndex!: number;

  private dragStartPosition: Point | null = null;

  private dragStartPoint: RectResponderModel | null = null;

  private isDragging = false;

  initialize() {
    this.type = 'zoom';
  }

  render(state: ChartState<Options>, computed) {
    if (!state.zoomRange) {
      return;
    }
    this.resetSelectionArea();
    const { viewRange } = computed;
    const { layout, axes, series, scale } = state;
    const categories = state.categories as string[];

    this.rect = layout.plot;
    this.startIndex = viewRange?.[0] ?? 0;

    const coordinateChart = isCoordinateSeries(series);
    if (coordinateChart) {
      const responderInfo = this.getRectResponderInfoForCoordinateType(
        series,
        scale,
        axes.xAxis as LabelAxisData,
        categories
      );
      this.responders = this.makeRectResponderModelForCoordinateType(responderInfo, categories);
    } else {
      this.responders = this.makeRectResponderModel(categories, axes.xAxis);
    }
  }

  getRectResponderInfoForCoordinateType(
    series: ZoomableSeries,
    scale: Scale,
    axisData: LabelAxisData,
    categories: string[]
  ) {
    const points: RectResponderInfoForCoordinateType[] = [];
    const duplicateCheckMap = {};

    Object.keys(series).forEach((seriesName) => {
      const data: LineSeriesType[] | AreaSeriesType[] = series[seriesName].data;
      data.forEach(({ rawData }) => {
        rawData.forEach((datum, idx) => {
          if (isNull(datum)) {
            return;
          }

          const dataIndex = getCoordinateDataIndex(datum, categories, idx, this.startIndex);
          const x = getXPosition(
            axisData,
            this.rect.width,
            getCoordinateXValue(datum as CoordinateDataType),
            dataIndex
          );
          const xWithinRect = x >= 0 && x <= this.rect.width;

          if (!duplicateCheckMap[x] && xWithinRect) {
            duplicateCheckMap[x] = true;
            points.push({ x, label: categories[dataIndex] });
          }
        });
      });
    });

    return points;
  }

  resetSelectionArea() {
    this.dragStartPosition = null;
    this.dragStartPoint = null;
    this.models.selectionArea = [];
    this.isDragging = false;
  }

  onMousedown({ responders, mousePosition }) {
    if (responders.length) {
      this.dragStartPoint = responders.find(
        (responder) => responder.data!.name === 'selectionArea'
      )!;
      this.dragStartPosition = mousePosition;
    }
  }

  onMouseup({ responders }: { responders: RectResponderModel[] }) {
    if (this.isDragging && this.dragStartPoint && responders.length) {
      const dragRange = [this.dragStartPoint, responders[0]]
        .sort((a, b) => a.index! - b.index!)
        .map((m) => m.data?.value);

      this.store.dispatch('zoom', dragRange);
      this.eventBus.emit('zoom', makeObservableObjectToNormal(dragRange));

      this.eventBus.emit('resetHoveredSeries');
      this.eventBus.emit('hideTooltip');
      // @TODO: Should occur after the series' click event
      // Additional logic to control the sequence of events with each other is required.
      setTimeout(() => {
        this.eventBus.emit('resetSelectedSeries');
      });
    }
    this.resetSelectionArea();
  }

  makeRectResponderModel(categories: string[], axisData: AxisData): RectResponderModel[] {
    const categorySize = categories.length;
    const { pointOnColumn, tickDistance } = axisData;
    const { height } = this.rect;

    const halfDetectAreaIndex = pointOnColumn ? [] : [0, categorySize - 1];
    const halfWidth = tickDistance / 2;

    return range(0, categorySize).map((index) => {
      const half = halfDetectAreaIndex.includes(index);
      const width = half ? halfWidth : tickDistance;
      let startX = 0;

      if (index !== 0) {
        startX += pointOnColumn ? tickDistance * index : halfWidth + tickDistance * (index - 1);
      }

      return {
        type: 'rect',
        x: startX,
        y: 0,
        height,
        width,
        index,
        data: { name: 'selectionArea', value: categories[index] },
      };
    });
  }

  makeRectResponderModelForCoordinateType(
    responderInfo: RectResponderInfoForCoordinateType[],
    categories: string[]
  ) {
    const responders = makeRectResponderModelForCoordinateType(responderInfo, this.rect);

    return responders.map((m, idx) => ({
      ...m,
      data: { name: 'selectionArea', value: categories[idx] },
    }));
  }

  onMousemove({ responders, mousePosition }) {
    if (!responders.length) {
      return;
    }

    if (this.dragStartPosition && !this.isDragging) {
      const { x } = mousePosition;
      const { x: startX } = this.dragStartPosition;

      this.isDragging = Math.abs(startX - x) > DRAG_MIN_WIDTH;
    }

    if (this.isDragging) {
      const startIndex = this.dragStartPoint!.index!;
      const endIndex = responders[0].index!;
      const [start, end] = [startIndex, endIndex].sort(sortNumber);
      const includedResponders = this.responders.slice(start, end + 1);

      this.models.selectionArea = [
        ...includedResponders.map<RectModel>((m) => ({
          ...m,
          x: m.x,
          y: 0,
          type: 'rect',
          color: 'rgba(0, 0, 0, 0.2)',
        })),
      ];
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.resetSelectionArea();
  }
}
