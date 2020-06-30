import Component from './component';
import { ChartState, Options, Series } from '@t/store/store';
import { ExportMenuButtonModel } from '@t/components/exportMenu';
import { isExportMenuVisible, padding } from '@src/store/layout';
import { LegendResponderModel } from '@t/components/legend';
import { Rect, TitleOption } from '@t/options';
import { execDownload, downloadSpreadSheet } from '@src/helpers/downloader';
import { isString } from '@src/helpers/utils';

import '../css/exportMenu.css';

const EXPORT_MENU_WIDTH = 140;
export const EXPORT_BUTTON_RECT_SIZE = 24;
export type BoxResponderModel = Rect & { type: 'box' };
export interface DataToExport {
  series: Series;
  categories?: string[];
}

export default class ExportMenu extends Component {
  models!: { exportMenuButton: ExportMenuButtonModel[] };

  opened = false;

  fileName!: string;

  data!: DataToExport;

  chartEl!: HTMLDivElement;

  exportMenuEl!: HTMLDivElement;

  toggleExportMenu = () => {
    this.opened = !this.opened;
    this.models.exportMenuButton[0].opened = this.opened;
    this.eventBus.emit('needDraw');

    if (this.opened) {
      this.chartEl.appendChild(this.exportMenuEl);
    } else {
      this.chartEl.removeChild(this.exportMenuEl);
    }
  };

  onClickExportButton = (ev) => {
    const { id } = ev.target;
    const canvas = this.chartEl.getElementsByTagName('canvas')[0];

    if (id === 'png' || id === 'jpeg') {
      execDownload(this.fileName, id, canvas.toDataURL(`image/${id}`, 1));
    } else {
      downloadSpreadSheet(this.fileName, id, this.data);
    }

    this.toggleExportMenu();
  };

  getExportMenuEl(chartWidth: number) {
    const { top, left } = this.chartEl.getBoundingClientRect();
    const topPosition = top + padding.Y + EXPORT_BUTTON_RECT_SIZE + 5;
    const leftPosition = left + chartWidth - EXPORT_MENU_WIDTH - padding.X;

    const el = document.createElement('div');
    el.onclick = this.onClickExportButton;
    el.innerHTML = `
        <div class="export-menu" style="top: ${topPosition}px; left: ${leftPosition}px;">
          <p class="export-menu-title">Export to</p>
          <div class="export-menu-btn-wrapper">
            <button class="export-menu-btn" id="xls">xls</button>
            <button class="export-menu-btn" id="csv">csv</button>
            <button class="export-menu-btn" id="png">png</button>
            <button class="export-menu-btn" id="jpeg">jpeg</button>
          </div>
        </div>
      `;

    return el;
  }

  initialize({ chartEl }) {
    this.chartEl = chartEl;
    this.type = 'exportMenu';
    this.name = 'exportMenu';
  }

  onClick({ responders }: { responders: LegendResponderModel[] }) {
    if (responders.length) {
      this.toggleExportMenu();
    }
  }

  getFileName(title?: string | TitleOption) {
    return isString(title) ? title : title?.text ?? 'tui-chart';
  }

  render({ options, layout, chart, series, categories }: ChartState<Options>) {
    if (!isExportMenuVisible(options.exportMenu?.visible)) {
      return;
    }

    this.data = { series, categories };
    this.fileName = this.getFileName(options?.exportMenu?.filename || chart.title);
    this.exportMenuEl = this.getExportMenuEl(chart.width);
    this.rect = layout.exportMenu;
    this.models = {
      exportMenuButton: [
        {
          type: 'exportMenuButton',
          x: 0,
          y: 0,
          opened: this.opened,
        },
      ],
    };

    this.responders = [
      {
        type: 'box',
        width: EXPORT_BUTTON_RECT_SIZE,
        height: EXPORT_BUTTON_RECT_SIZE,
        x: this.rect.x,
        y: this.rect.y,
      },
    ];
  }
}
