import { makeStyleObj, setLineDash, fillStyle, strokeWithOptions } from '@src/helpers/style';
import { CircleStyleName } from '@t/brushes';
import { CircleStyle, CompareCircleModel } from '@t/components/series';

const circleStyle = {
    default: {
      strokeStyle: '#ffffff',
      lineWidth: 2,
    },
    plot: {
      lineWidth: 1,
      strokeStyle: 'rgba(0, 0, 0, 0.05)',
    },
};

function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
  var len = str.length,
    s;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(-1 * angle / 2);
  context.rotate(-1 * (angle / len) / 2);
  for (var n = 0; n < len; n++) {
    context.rotate(angle / len);
    context.save();
    context.translate(0, -1 * radius);
    s = str[n];
    context.fillText(s, 0, 0);
    context.restore();
  }
  context.restore();
}

export function comparecircle(ctx: CanvasRenderingContext2D, circleModel: CompareCircleModel) {
    const {
      x,
      y,
      style,
      radius,
      color,
      angle = { start: 0, end: Math.PI * 2 },
      borderWidth: lineWidth,
      borderColor: strokeStyle,
    } = circleModel;
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
  
    if (style) {
      const styleObj = makeStyleObj<CircleStyle, CircleStyleName>(style, circleStyle);
  
      Object.keys(styleObj).forEach((key) => {
        ctx[key] = styleObj[key];
      });
    }
  
    ctx.arc(x, y, radius, angle.start, angle.end, true);
  
    strokeWithOptions(ctx, { lineWidth, strokeStyle });
  
    fillStyle(ctx, color);
  
    ctx.closePath();


    // ctx.font = '10pt Arial';
    // ctx.textAlign = 'center';
    // ctx.fillStyle = 'rgb(0,0,0)';
    // ctx.strokeStyle = 'rgb(0,0,0)';
    // ctx.lineWidth = 1;
    // drawTextAlongArc(ctx, 'Jämförelseområdets snitt', x, y, radius-15, Math.PI );
}