import { circle } from "./basic";
import { label } from "./label";
export function circleLegend(ctx, circleLegendModel) {
    const { x, y, radius, value } = circleLegendModel;
    const ratioArray = [1, 0.5, 0.25];
    ratioArray.forEach((ratio, idx) => {
        const circleRadius = ratio * radius;
        const circleY = y + (idx ? (1 - ratio) * radius : 0);
        circle(ctx, {
            type: 'circle',
            x,
            y: circleY,
            radius: circleRadius,
            color: '#fff',
            seriesIndex: 0,
            style: ['default', { strokeStyle: '#888', lineWidth: 1 }],
        });
        label(ctx, {
            type: 'label',
            x,
            y: circleY - circleRadius,
            text: String(value * ratio),
            style: ['default', { textAlign: 'center', textBaseline: 'bottom' }],
        });
    });
}
