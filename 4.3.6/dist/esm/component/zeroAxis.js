import Component from "./component";
import { isLabelAxisOnYAxis } from "../helpers/axes";
import { crispPixel } from "../helpers/calculator";
import { isNumber } from "../helpers/utils";
export default class ZeroAxis extends Component {
    constructor() {
        super(...arguments);
        this.models = [];
    }
    initialize() {
        this.type = 'zeroAxis';
        this.name = 'zeroAxis';
    }
    render({ layout, axes, series, options }) {
        this.rect = layout.plot;
        const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options });
        const valueAxisName = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
        const { zeroPosition } = axes[valueAxisName];
        if (isNumber(zeroPosition)) {
            this.models = this.renderZeroModel(zeroPosition, labelAxisOnYAxis);
        }
    }
    renderZeroModel(zeroPosition, vertical) {
        const zeroPixel = crispPixel(0);
        const position = crispPixel(zeroPosition);
        let model;
        if (vertical) {
            model = {
                type: 'line',
                x: position,
                y: zeroPixel,
                x2: position,
                y2: crispPixel(this.rect.height),
                strokeStyle: 'rgba(0, 0, 0, 0.5)',
            };
        }
        else {
            model = {
                type: 'line',
                x: zeroPixel,
                y: position,
                x2: crispPixel(this.rect.width),
                y2: position,
                strokeStyle: 'rgba(0, 0, 0, 0.5)',
            };
        }
        return [model];
    }
}
