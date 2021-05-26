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
  getRGBA,
} from '@toast-ui/shared';
import { GeoFeature } from '@t/store';

function getGeoFeature(geoFeatures: GeoFeature[], code: string): GeoFeature | undefined {
  return geoFeatures.find(({ id }) => id === code);
}

function getGeoFeatures() {
  return worldJSONData.features as GeoFeature[];
}

function getSeries(userData: Data[]): Series {
  const geoFeatures = getGeoFeatures();

  return userData.map(({ code, data }) => ({
    feature: getGeoFeature(geoFeatures, code),
    data,
  }));
}

const series: StoreModule = {
  name: 'series',
  state: () => ({
    outline: getGeoFeatures(),
    series: [] as Series,
  }),
  action: {
    setSeriesColor({ state, initStoreState }: ActionParams) {
      const { data } = initStoreState;
      const { theme, scale } = state;
      const { startColor, endColor } = theme;

      const seriesWithoutColor = getSeries(data);
      const startRGB = hexToRGB(startColor) as RGB;
      const distances = makeDistances(startRGB, hexToRGB(endColor) as RGB);

      const seriesWithColor = seriesWithoutColor.map((seriesData) => {
        if (isNumber(seriesData.data)) {
          const colorRatio = getColorRatio(scale.limit, seriesData.data)!;
          seriesData.color = getRGBA(getSpectrumColor(colorRatio, distances, startRGB), 0.7);
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
