import { Point, Rect } from '@t/store';
import { ExtendedFeature, geoContains, GeoProjection } from 'd3-geo';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';
import { RectResponderModel } from '@t/components/common';

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
  }: ResponderDetectorModel<RectResponderModel>) => {
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
    componentRect = { x: 0, y: 0, width: 0, height: 0 },
  }: ResponderDetectorModel<GeoFeatureResponderModel>) => {
    const { x: compX, y: compY } = componentRect;
    const mapCoordinate = projection?.invert?.([mousePosition.x - compX, mousePosition.y - compY]);

    return mapCoordinate && geoContains(model.feature as ExtendedFeature, mapCoordinate);
  },
};
