import Component from "./component";
export default class Background extends Component {
    initialize() {
        this.type = 'background';
        this.name = 'background';
    }
    render({ layout, theme }) {
        const { width, height } = layout.chart;
        this.theme = theme.chart;
        this.rect = { x: 0, y: 0, width, height };
        this.models = [
            Object.assign(Object.assign({ type: 'rect' }, this.rect), { color: this.theme.backgroundColor }),
        ];
    }
}
