import Component from "./component";
import { getMaxRadius } from "./bubbleSeries";
import { message } from "../message";
export default class CircleLegend extends Component {
    constructor() {
        super(...arguments);
        this.models = { circleLegend: [] };
    }
    initialize() {
        this.type = 'circleLegend';
    }
    render({ layout, series, circleLegend }) {
        if (!series.bubble) {
            throw new Error(message.CIRCLE_LEGEND_RENDER_ERROR);
        }
        this.isShow = circleLegend.visible;
        if (!this.isShow) {
            return;
        }
        const bubbleData = series.bubble.data;
        this.rect = layout.circleLegend;
        this.renderCircleLegend(bubbleData, circleLegend);
    }
    renderCircleLegend(bubbleData, circleLegend) {
        const value = getMaxRadius(bubbleData);
        const { radius } = circleLegend;
        this.models.circleLegend = [
            {
                type: 'circleLegend',
                radius,
                value,
                x: radius,
                y: this.rect.height - radius,
            },
        ];
    }
}
