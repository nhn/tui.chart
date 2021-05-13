import { StoreModule } from '@t/store';
import { feature } from 'topojson-client';
import worldJSONData from '../../data/world.json';

function getGeoFeatures() {
  return feature(worldJSONData, worldJSONData.objects.countries).features;
}

const series: StoreModule = {
  name: 'series',
  state: () => ({
    series: getGeoFeatures(),
  }),
  action: {},
};

export default series;
