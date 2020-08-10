import Component from './component';
import { RadarSeriesModels, PolygonModel } from '@t/components/series';
import { ChartState, Options } from '@t/store/store';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { RadarSeriesType } from '@t/options';

export default class RadarSeries extends Component {
  models: RadarSeriesModels = { polygon: [], dot: [] };

  initialize() {
    this.type = 'series';
    this.name = 'radarSeries';
  }

  render(state: ChartState<Options>) {
    const { layout, series, legend, categories } = state;

    if (!series.radar) {
      throw new Error("There's no radar data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

    const radarData = series.radar?.data;

    this.models.polygon = this.renderPolygonModels(radarData);
    this.models.dot = [];
  }

  renderPolygonModels(seriesData: RadarSeriesType[]): PolygonModel[] {
    const min = 0; // @TODO
    const max = 9000; // @TODO
    const radius = Math.min(this.rect.width, this.rect.height) / 2;

    return seriesData.flatMap(({ data, color, name }) => {
      return data.map((value) => {
        const distance = (value / (max - min)) * radius;

        return {
          type: 'polygon',
          name,
          color,
          style: ['default'],
        };
      });
    });
  }
}
