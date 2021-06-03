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
import Painter from '@src/painter';
import { GeoPermissibleObjects } from 'd3-geo';

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
          // @TODO: A darker color than the series color should be applied.
          //  Will ask the designer about the default color and opacity.
          seriesData.color = getRGBA(getSpectrumColor(colorRatio, distances, startRGB), 0.7);
        }

        return seriesData;
      });

      extend(state.series, seriesWithColor);
    },
    updateSeriesCentroid({ state }: ActionParams, { painter }: { painter: Painter }) {
      const { gp } = painter;

      const seriesWithCentroid = state.series.map((m) => ({
        ...m,
        centroid: gp.centroid(m.feature as GeoPermissibleObjects),
      }));

      extend(state.series, seriesWithCentroid);
    },
  },
  observe: {
    updateSeriesObserve() {
      this.dispatch('setSeriesColor');
    },
  },
};

export default series;
