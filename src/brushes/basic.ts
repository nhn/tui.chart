import {
  ClipRectAreaModel,
  LinePointsModel,
  PathRectModel,
  CircleModel,
  CircleStyle,
  AreaPointsModel
} from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';

export type CircleStyleName = 'default' | 'hover';

const circleStyle = {
  default: {
    strokeStyle: '#fff',
    lineWidth: 2
  },
  hover: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 4,
    shadowOffsetY: 4,
    lineWidth: 4
  }
};

export function clipRectArea(ctx: CanvasRenderingContext2D, clipRectAreaModel: ClipRectAreaModel) {
  const { x, y, width, height } = clipRectAreaModel;

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
}

export function linePoints(ctx: CanvasRenderingContext2D, linePointsModel: LinePointsModel) {
  const { color, lineWidth, points } = linePointsModel;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();

  points.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);

      return;
    }

    if (point.controlPoint) {
      const { x: prevX, y: prevY } = points[idx - 1].controlPoint!.next;
      const { controlPoint, x, y } = point;

      ctx.bezierCurveTo(prevX, prevY, controlPoint.prev.x, controlPoint.prev.y, x, y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
  ctx.closePath();
}

export function areaPoints(ctx: CanvasRenderingContext2D, areaPointsModel: AreaPointsModel) {
  const { color, lineWidth, points, BottomYPoint, fillColor } = areaPointsModel;

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath();

  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  points.forEach((point, idx) => {
    if (idx === 0) {
      ctx.moveTo(point.x, point.y);

      return;
    }

    if (point.controlPoint) {
      const { x: prevX, y: prevY } = points[idx - 1].controlPoint!.next;
      const { controlPoint, x, y } = point;

      ctx.bezierCurveTo(prevX, prevY, controlPoint.prev.x, controlPoint.prev.y, x, y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.lineTo(endPoint.x, BottomYPoint);
  ctx.lineTo(startPoint.x, BottomYPoint); // @TODO: x축의 y 위치 가져오기
  ctx.lineTo(startPoint.x, startPoint.y);

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.stroke();
  ctx.closePath();
}

export function pathRect(ctx: CanvasRenderingContext2D, pathRectModel: PathRectModel) {
  const { x, y, width, height, radius = 0, stroke = 'black', fill = '' } = pathRectModel;

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

export function circle(ctx: CanvasRenderingContext2D, circleModel: CircleModel) {
  const { x, y, style, radius, color } = circleModel;

  ctx.beginPath();
  ctx.fillStyle = color;

  if (style) {
    const styleObj = makeStyleObj<CircleStyle>(style, circleStyle);

    Object.keys(styleObj).forEach(key => {
      ctx[key] = styleObj[key];
    });
  }

  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
