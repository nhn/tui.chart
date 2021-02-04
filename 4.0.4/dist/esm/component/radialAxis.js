import Component from "./component";
import { getRadialRadiusValues } from "../helpers/radarSeries";
import { calculateDegreeToRadian, getRadialPosition } from "../helpers/sector";
const padding = { X: 5, Y: 1 };
const RADIAL_AXIS_LABEL_RECT_BORDER_RADIUS = 7;
function filterDisplayLabels(labels) {
    return labels.slice(1, labels.length - 1);
}
export default class RadialAxis extends Component {
    constructor() {
        super(...arguments);
        this.models = [];
    }
    initialize() {
        this.type = 'axis';
        this.name = 'radial';
    }
    render({ layout, axes }) {
        this.rect = layout.plot;
        if (!axes.radialAxis) {
            return;
        }
        const { axisSize, centerX, centerY, labels, maxLabelWidth, maxLabelHeight, labelInterval, } = axes.radialAxis;
        const radiusRange = filterDisplayLabels(getRadialRadiusValues(labels, axisSize));
        const width = maxLabelWidth + padding.X * 2;
        const height = maxLabelHeight + padding.Y * 2;
        const viewLabels = filterDisplayLabels(labels);
        this.models = viewLabels.reduce((positions, text, index) => {
            return index % labelInterval
                ? positions
                : [
                    ...positions,
                    Object.assign({ type: 'rectLabel', text, style: ['rectLabel'], width,
                        height, borderRadius: RADIAL_AXIS_LABEL_RECT_BORDER_RADIUS, backgroundColor: '#f3f3f3' }, getRadialPosition(centerX, centerY, radiusRange[index], calculateDegreeToRadian(0))),
                ];
        }, []);
    }
}
