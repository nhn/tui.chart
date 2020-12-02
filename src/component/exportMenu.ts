import Component from './component';
import { Categories, ChartState, Options, Series } from '@t/store/store';
import { ExportMenuModels } from '@t/components/exportMenu';
import { isExportMenuVisible, padding } from '@src/store/layout';
import { TitleOption } from '@t/options';
import { execDownload, downloadSpreadSheet } from '@src/helpers/downloader';
import { isString } from '@src/helpers/utils';
import { RectResponderModel } from '@t/components/series';
import { ExportMenuTheme, ExportMenuButtonTheme, FontTheme, ExportMenuPanelTheme } from '@t/theme';
import { getFontStyleString } from '@src/helpers/style';

const EXPORT_MENU_WIDTH = 140;
export const BUTTON_RECT_SIZE = 24;
export interface DataToExport {
  series: Series;
  categories?: Categories;
}

export default class ExportMenu extends Component {
  responders!: RectResponderModel[];

  models: ExportMenuModels = { exportMenuButton: [] };

  opened = false;

  fileName!: string;

  data!: DataToExport;

  chartEl!: HTMLDivElement;

  exportMenuEl!: HTMLDivElement;

  theme!: Required<ExportMenuTheme>;

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

  getCanvasExportBtnRemoved = () => {
    const canvas = this.chartEl.getElementsByTagName('canvas')[0];
    const ctx = canvas.getContext('2d')!;
    const { x, y, height: h, width: w } = this.rect;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);

    return canvas;
  };

  onClickExportButton = (ev) => {
    const { id } = ev.target;

    if (id === 'png' || id === 'jpeg') {
      const canvas = this.getCanvasExportBtnRemoved();
      execDownload(this.fileName, id, canvas.toDataURL(`image/${id}`, 1));
    } else {
      downloadSpreadSheet(this.fileName, id, this.data);
    }

    this.toggleExportMenu();
  };

  getExportMenuEl(chartWidth: number) {
    const { top, left } = this.chartEl.getBoundingClientRect();
    const topPosition = top + padding.Y + BUTTON_RECT_SIZE + 5;
    const leftPosition = left + chartWidth - EXPORT_MENU_WIDTH - padding.X;

    const el = document.createElement('div');
    el.onclick = this.onClickExportButton;
    el.innerHTML = `
        <div class="export-menu" style="top: ${topPosition}px; left: ${leftPosition}px; ${this.makePanelBorderStyle()}">
          <p class="export-menu-title" style="${this.makePanelStyle('header')}">Export to</p>
          <div class="export-menu-btn-wrapper" style="${this.makePanelStyle('body')}">
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

  onClick({ responders }: { responders: RectResponderModel[] }) {
    if (responders.length) {
      this.toggleExportMenu();
    }
  }

  getFileName(title?: string | TitleOption) {
    return isString(title) ? title : title?.text ?? 'tui-chart';
  }

  render({ options, layout, chart, series, categories, theme }: ChartState<Options>) {
    this.isShow = isExportMenuVisible(options);

    if (!this.isShow) {
      return;
    }

    this.theme = theme.exportMenu as Required<ExportMenuTheme>;
    this.data = { series, categories };
    this.fileName = this.getFileName(options?.exportMenu?.filename || chart.title);
    this.exportMenuEl = this.getExportMenuEl(chart.width);
    this.rect = layout.exportMenu;
    this.models.exportMenuButton = [
      {
        type: 'exportMenuButton',
        x: 0,
        y: 0,
        opened: this.opened,
        theme: this.theme.button as Required<ExportMenuButtonTheme>,
      },
    ];

    this.responders = [
      {
        type: 'rect',
        width: BUTTON_RECT_SIZE,
        height: BUTTON_RECT_SIZE,
        x: 0,
        y: 0,
      },
    ];
  }

  makePanelBorderStyle() {
    const { borderRadius, borderWidth, borderColor } = this.theme.panel;

    return `border: ${borderWidth}px solid ${borderColor}; border-radius: ${borderRadius}px;`;
  }

  makePanelStyle(type: 'header' | 'body') {
    const sectionTheme = this.theme.panel![type];
    const direction = type === 'header' ? 'top' : 'bottom';
    const { borderRadius, borderWidth } = this.theme.panel as Required<ExportMenuPanelTheme>;
    const borderRadiusPx = `${borderRadius - borderWidth}px`;

    return [
      `${getFontStyleString(sectionTheme as FontTheme)}`,
      `border-${direction}-left-radius: ${borderRadiusPx};`,
      `border-${direction}-right-radius: ${borderRadiusPx};`,
      `background-color: ${sectionTheme!.backgroundColor};`,
    ].join();
  }
}
