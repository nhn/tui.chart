import { SeriesData } from '@t/store';

export interface GeoFeatureModel extends SeriesData {
  type: 'geoFeature';
}

export interface GeoFeatureResponderModel extends GeoFeatureModel {
  responderType: 'geoFeature';
}
