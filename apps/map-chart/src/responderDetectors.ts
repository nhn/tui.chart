import { Point, Rect } from '@t/store';
import { geoContains, GeoProjection } from 'd3-geo';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';

type DetectorType = 'geoFeature' | 'rect';

type ResponderDetectors = {
  [key in DetectorType]: Function;
};

interface ResponderDetectorModel<T> {
  mousePosition: Point;
  model: T;
  componentRect?: Rect;
  projection?: GeoProjection;
}

export const responderDetectors: ResponderDetectors = {
  rect: ({
    mousePosition,
    model,
    componentRect = { x: 0, y: 0, width: 0, height: 0 },
  }: ResponderDetectorModel<any>) => {
    const { x, y } = mousePosition;
    const { x: modelX, y: modelY, width, height } = model;
    const { x: compX, y: compY } = componentRect;

    return (
      x >= modelX + compX &&
      x <= modelX + compX + width &&
      y >= modelY + compY &&
      y <= modelY + compY + height
    );
  },
  geoFeature: ({
    mousePosition,
    model,
    projection,
  }: ResponderDetectorModel<GeoFeatureResponderModel>) => {
    const mapCoordinate = projection?.invert?.([mousePosition.x, mousePosition.y]);

    return mapCoordinate && geoContains(model.feature, mapCoordinate);
  },
};
