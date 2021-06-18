import Component from './component';
import { Categories, ChartState, Options, Series } from '@t/store/store';
import { ExportMenuModels } from '@t/components/exportMenu';
import { isExportMenuVisible, padding } from '@src/store/layout';
import { TitleOption } from '@t/options';
import { execDownload, downloadSpreadSheet } from '@src/helpers/downloader';
import { isString } from '@src/helpers/utils';
import { RectResponderModel } from '@t/components/series';
import { ExportMenuTheme, ExportMenuButtonTheme, FontTheme, ExportMenuPanelTheme } from '@t/theme';
import { getFontStyleString, getTranslateString } from '@src/helpers/style';

const EXPORT_MENU_WIDTH = 140;
const exportExtensions = {
  IMAGES: ['png', 'jpeg'],
  SPREAD_SHEETS: ['xls', 'csv'],
};

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

  chartBackgroundColor!: string;

  chartWidth = 0;

  toggleExportMenu = () => {
    this.opened = !this.opened;
    this.models.exportMenuButton[0].opened = this.opened;
    this.eventBus.emit('needDraw');

    if (this.opened) {
      this.applyPanelWrapperStyle();
      this.chartEl.appendChild(this.exportMenuEl);
    } else {
      this.chartEl.removeChild(this.exportMenuEl);
    }
  };

  getCanvasExportBtnRemoved = () => {
    const canvas = this.chartEl.getElementsByTagName('canvas')[0];
    const ctx = canvas.getContext('2d')!;
    const { x, y, height: h, width: w } = this.rect;

    ctx.clearRect(x, y, w, h);
    ctx.fillStyle = this.chartBackgroundColor;
    ctx.fillRect(x, y, w, h);

    return canvas;
  };

  onClickExportButton = (ev) => {
    const { id } = ev.target;
    const isImageExtension = exportExtensions.IMAGES.includes(id);
    const isSpreadSheetExtension = exportExtensions.SPREAD_SHEETS.includes(id);

    if (isImageExtension) {
      const canvas = this.getCanvasExportBtnRemoved();
      execDownload(this.fileName, id, canvas.toDataURL(`image/${id}`, 1));
    } else if (isSpreadSheetExtension) {
      downloadSpreadSheet(this.fileName, id, this.data);
    }

    if (isImageExtension || isSpreadSheetExtension) {
      this.toggleExportMenu();
    }
  };

  applyExportButtonPanelStyle() {
    const exportMenuTitle = this.exportMenuEl.querySelector('.toastui-chart-export-menu-title')!;
    const menuBtnWrapper = this.exportMenuEl.querySelector(
      '.toastui-chart-export-menu-btn-wrapper'
    )!;

    exportMenuTitle.setAttribute('style', this.makePanelStyle('header'));
    menuBtnWrapper.setAttribute('style', this.makePanelStyle('body'));
  }

  makeExportMenuButton() {
    const el = document.createElement('div');
    el.onclick = this.onClickExportButton;
    el.innerHTML = `
        <div class="toastui-chart-export-menu">
          <p class="toastui-chart-export-menu-title">Export to</p>
          <div class="toastui-chart-export-menu-btn-wrapper">
            <button class="toastui-chart-export-menu-btn" id="xls">xls</button>
            <button class="toastui-chart-export-menu-btn" id="csv">csv</button>
            <button class="toastui-chart-export-menu-btn" id="png">png</button>
            <button class="toastui-chart-export-menu-btn" id="jpeg">jpeg</button>
          </div>
        </div>
      `;

    return el;
  }

  initialize({ chartEl }) {
    this.chartEl = chartEl;
    this.type = 'exportMenu';
    this.name = 'exportMenu';
    this.exportMenuEl = this.makeExportMenuButton();
  }

  onClick({ responders }: { responders: RectResponderModel[] }) {
    if (responders.length) {
      this.toggleExportMenu();
    }
  }

  getFileName(title?: string | TitleOption) {
    return isString(title) ? title : title?.text ?? 'toast-ui-chart';
  }

  render({ options, layout, chart, series, rawCategories, theme }: ChartState<Options>) {
    this.isShow = isExportMenuVisible(options);
    this.chartWidth = chart.width;

    if (!this.isShow) {
      return;
    }

    this.chartBackgroundColor = theme.chart.backgroundColor!;
    this.theme = theme.exportMenu as Required<ExportMenuTheme>;
    this.data = { series, categories: rawCategories };
    this.fileName = this.getFileName(options?.exportMenu?.filename || chart.title);
    this.applyExportButtonPanelStyle();
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

  applyPanelWrapperStyle() {
    const exportMenu = this.exportMenuEl.querySelector('.toastui-chart-export-menu')!;
    const x = this.chartWidth - EXPORT_MENU_WIDTH - padding.X;
    const y = padding.Y + BUTTON_RECT_SIZE + 5;
    const { borderRadius, borderWidth, borderColor } = this.theme.panel;

    const style = `
      transform: ${getTranslateString(x, y)};
      border: ${borderWidth}px solid ${borderColor};
      border-radius: ${borderRadius}px;`;

    exportMenu.setAttribute('style', style);
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
    ].join('');
  }
}
