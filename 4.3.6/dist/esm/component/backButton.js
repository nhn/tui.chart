import Component from "./component";
import { isUsingResetButton } from "../store/layout";
import { BUTTON_RECT_SIZE } from "./exportMenu";
export default class BackButton extends Component {
    initialize() {
        this.type = 'backButton';
        this.name = 'backButton';
    }
    onClick({ responders }) {
        if (responders.length) {
            this.store.dispatch('zoomBack');
            this.eventBus.emit('resetSelectedSeries');
        }
    }
    render({ options, layout }, computed) {
        if (!isUsingResetButton(options)) {
            return;
        }
        this.rect = layout.resetButton;
        this.isShow = computed.isTreemapSeriesZooming;
        this.models = this.isShow ? [{ type: 'backButton', x: 0, y: 0 }] : [];
        this.responders = this.isShow
            ? [{ type: 'rect', x: 0, y: 0, width: BUTTON_RECT_SIZE, height: BUTTON_RECT_SIZE }]
            : [];
    }
}
