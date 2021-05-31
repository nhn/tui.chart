import { GeoPath, GeoPermissibleObjects } from 'd3-geo';
import { GeoFeatureModel } from '@t/components/geoFeature';
import { setSize } from '@src/helpers/painter';

const cachedGeoFeatureCanvasMap = {};

function getGeoFeatureRect(model: GeoFeatureModel, gp: GeoPath) {
  const feature = model.feature as GeoPermissibleObjects;
  const [[x, y], [x2, y2]] = gp.bounds(feature);
  const width = Math.max(Math.ceil(x2 - x), 1);
  const height = Math.max(Math.ceil(y2 - y), 1);

  return { x, y, height, width };
}

function getGeoFeatureCanvasInfo(model: GeoFeatureModel, gp: GeoPath) {
  const id = model.feature?.id;

  if (id && cachedGeoFeatureCanvasMap[id]) {
    return cachedGeoFeatureCanvasMap[id];
  }

  const { width, height, x, y } = getGeoFeatureRect(model, gp);
  const areaCanvas = document.createElement('canvas');
  const areaCtx = areaCanvas.getContext('2d')!;

  setSize(areaCanvas, areaCtx, width, height);
  const geoFeatureCanvasInfo = { areaCanvas, areaCtx, x, y, width, height };

  if (id) {
    cachedGeoFeatureCanvasMap[id] = geoFeatureCanvasInfo;
  }

  return geoFeatureCanvasInfo;
}

function geoFeature(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const feature = model.feature as GeoPermissibleObjects;

  const geoFeatureCanvasInfo = getGeoFeatureCanvasInfo(model, gp);
  const { areaCtx, areaCanvas, x, y } = geoFeatureCanvasInfo;

  areaCtx.clearRect(0, 0, areaCanvas.width, areaCanvas.height);
  areaCtx.save();
  areaCtx.translate(-x, -y);
  areaCtx.beginPath();
  gp.context(areaCtx)(feature);
  areaCtx.restore();

  return geoFeatureCanvasInfo;
}

export function series(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const { color } = model;
  const { areaCtx, areaCanvas, x, y, width, height } = geoFeature(ctx, model, gp);
  if (color) {
    areaCtx.fillStyle = color;
    areaCtx.fill();
  }
  areaCtx.strokeStyle = '#666'; // @TODO: Need to apply according to theme system
  areaCtx.stroke();

  ctx.drawImage(areaCanvas, x, y, width, height);
}

export function outline(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const { areaCtx, areaCanvas, x, y, width, height } = geoFeature(ctx, model, gp);
  areaCtx.strokeStyle = '#bbb'; // @TODO: Need to apply according to the theme system
  areaCtx.stroke();
  ctx.drawImage(areaCanvas, x, y, width, height);
}
