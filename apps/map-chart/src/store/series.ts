import { ActionParams, Data, Series, StoreModule } from '@t/store';
// import { feature } from 'topojson-client';
// import worldJSONData from '../../data/world.json';
import worldJSONData from '../../data/world-geo.json';
import {
  makeDistances,
  hexToRGB,
  RGB,
  extend,
  isNumber,
  getColorRatio,
  getSpectrumColor,
  isUndefined,
} from '@toast-ui/shared';
import { GeoFeature } from '@t/store';

function getData(data: Data[], id?: string) {
  if (isUndefined(id)) {
    return;
  }

  return data.find((datum) => datum.code === id)?.data;
}

function getGeoFeatures(data: Data[]): Series {
  return (worldJSONData.features as GeoFeature[]).map((feature) => ({
    feature,
    data: getData(data, feature?.id),
  }));
}

const series: StoreModule = {
  name: 'series',
  state: () => ({
    series: [] as Series,
  }),
  action: {
    setSeriesColor({ state, initStoreState }: ActionParams) {
      const { data } = initStoreState;
      const { theme, scale } = state;
      const { startColor, endColor } = theme;

      const geoFeatures = getGeoFeatures(data);
      const startRGB = hexToRGB(startColor) as RGB;
      const distances = makeDistances(startRGB, hexToRGB(endColor) as RGB);

      const seriesWithColor = geoFeatures.map((seriesData) => {
        if (isNumber(seriesData.data)) {
          const colorRatio = getColorRatio(scale.limit, seriesData.data)!;
          seriesData.color = getSpectrumColor(colorRatio, distances, startRGB);
        }

        return seriesData;
      });

      extend(state.series, seriesWithColor);
    },
  },
  observe: {
    updateSeriesObserve() {
      this.dispatch('setSeriesColor');
    },
  },
};

export default series;
