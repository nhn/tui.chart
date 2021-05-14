export interface GeoFeatureModel {
  type: 'geoFeature';
  color: string;
  feature: any; // @TODO: set feature type after extracting geoJson data
}

export interface GeoFeatureResponderModel extends GeoFeatureModel {
  responderType: 'geoFeature';
}
