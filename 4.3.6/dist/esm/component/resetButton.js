import Component from "./component";
import { isUsingResetButton } from "../store/layout";
import { BUTTON_RECT_SIZE } from "./exportMenu";
export default class ResetButton extends Component {
    initialize() {
        this.type = 'resetButton';
        this.name = 'resetButton';
    }
    onClick({ responders }) {
        if (responders.length) {
            this.eventBus.emit('resetZoom');
            this.store.dispatch('resetZoom');
        }
    }
    render({ options, layout }, computed) {
        if (!isUsingResetButton(options)) {
            return;
        }
        this.rect = layout.resetButton;
        this.isShow = computed.isLineTypeSeriesZooming;
        this.models = this.isShow ? [{ type: 'resetButton', x: 0, y: 0 }] : [];
        this.responders = this.isShow
            ? [{ type: 'rect', x: 0, y: 0, width: BUTTON_RECT_SIZE, height: BUTTON_RECT_SIZE }]
            : [];
    }
}
