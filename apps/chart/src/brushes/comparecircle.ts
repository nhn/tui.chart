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
}