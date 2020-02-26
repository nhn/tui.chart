export type Point = {
  x: number;
  y: number;
};

export type ClipRectAreaModel = {
  type: 'clipRectArea';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: Point[];
};

export type PathRectModel = {
  type: 'pathRect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  fill?: string;
  stroke?: string;
};

export function clipRectArea(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: ClipRectAreaModel
) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
}

export function linePoints(
  ctx: CanvasRenderingContext2D,
  { color, points, lineWidth }: LinePointsModel
) {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
  ctx.closePath();
}

export function pathRect(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height, radius = 0, stroke = 'black', fill = '' }: PathRectModel
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}
