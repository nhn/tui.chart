import Component from './component';
import { ChartState, Options } from '@t/store/store';
import { ExportMenuButtonModel, ExportMenuModel } from '@t/components/exportMenu';
import { isExportMenuVisible } from '@src/store/layout';
import { LegendResponderModel } from '@t/components/legend';
import { Rect } from '@t/options';

export const EXPORT_BUTTON_RECT_SIZE = 24;
export type BoxResponderModel = Rect & { type: 'box' };

export default class ExportMenu extends Component {
  models!: { exportMenuButton: ExportMenuButtonModel[]; exportMenu: ExportMenuModel[] };

  initialize() {
    this.type = 'exportMenu';
    this.name = 'exportMenu';
  }

  onClick({ responders }: { responders: LegendResponderModel[] }) {
    if (responders.length) {
      console.log(responders);
    }
  }

  render({ options, layout }: ChartState<Options>) {
    if (!isExportMenuVisible(options.exportMenu?.visible)) {
      return;
    }

    this.rect = layout.exportMenu;
    this.models = {
      exportMenuButton: [
        {
          type: 'exportMenuButton',
          x: 0,
          y: 0,
          opened: false,
        },
      ],
      exportMenu: [
        {
          type: 'exportMenu',
          x: 0,
          y: 0,
        },
      ],
    };

    this.responders = this.models.exportMenuButton.map(() => ({
      type: 'box',
      width: EXPORT_BUTTON_RECT_SIZE,
      height: EXPORT_BUTTON_RECT_SIZE,
      x: this.rect.x,
      y: this.rect.y,
    }));
  }
}
