import { GeoPath, GeoPermissibleObjects } from 'd3-geo';
import { setSize } from '@src/helpers/painter';
import { GeoFeatureModel } from '@t/components/geoFeature';

function geoFeature(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const feature = model.feature as GeoPermissibleObjects;
  const areaCanvas = document.createElement('canvas');
  const areaCtx = areaCanvas.getContext('2d')!;
  const [[x, y], [x2, y2]] = gp.bounds(feature);
  const width = Math.max(x2 - x, 1);
  const height = Math.max(y2 - y, 1);
  setSize(areaCanvas, areaCtx, width, height);

  areaCtx.beginPath();
  areaCtx.translate(-x, -y);

  gp.context(areaCtx)(feature);

  return { areaCanvas, areaCtx, x, y, width, height };
}

export function series(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const { color } = model;
  const { areaCtx, areaCanvas, x, y, width, height } = geoFeature(ctx, model, gp);
  if (color) {
    areaCtx.fillStyle = color;
    areaCtx.fill();
  }
  areaCtx.strokeStyle = '#333';
  areaCtx.stroke();

  ctx.drawImage(areaCanvas, x, y, width, height);
}

export function outline(ctx: CanvasRenderingContext2D, model: GeoFeatureModel, gp: GeoPath) {
  const { areaCtx, areaCanvas, x, y, width, height } = geoFeature(ctx, model, gp);
  areaCtx.strokeStyle = '#bbb';
  areaCtx.stroke();
  ctx.drawImage(areaCanvas, x, y, width, height);
}
