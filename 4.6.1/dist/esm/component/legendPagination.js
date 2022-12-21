"use strict";
// import Component from './component';
// import { ChartState, Options } from '@t/store/store';
// import { LegendModel } from '@t/components/legend';
// import { RectResponderModel } from '@t/components/series';
// import { LegendTheme } from '@t/theme';
// import { makeObservableObjectToNormal } from '@src/store/reactive';
//
// export default class Legend extends Component {
//   models!: LegendModel[];
//
//   responders!: RectResponderModel[];
//
//   theme!: Required<LegendTheme>;
//
//   activatedResponders: RectResponderModel[] = [];
//
//   seriesColorMap: Record<string, string> = {};
//
//   seriesIconTypeMap: Record<string, string> = {};
//
//   onClick({ responders }: { responders: RectResponderModel[] }) {
//     if (responders.length) {
//       const { data } = responders[0];
//       if (data?.name === 'pagination') {
//         this.eventBus.emit('clickPagination', makeObservableObjectToNormal(responders));
//       }
//     }
//   }
//
//   onClickCheckbox = (responders) => {
//     const { label, checked } = responders[0];
//
//     this.store.dispatch('setAllLegendActiveState', true);
//     this.store.dispatch('setLegendCheckedState', { name: label, checked: !checked });
//
//     if (checked) {
//       this.store.dispatch('disableSeries', label);
//     } else {
//       this.store.dispatch('enableSeries', label);
//     }
//
//     this.eventBus.emit('needDraw');
//   };
//
//   onClickLabel = (responders) => {
//     const { label } = responders[0];
//     this.eventBus.emit('resetSelectedSeries');
//
//     if (this.activatedResponders.length && this.activatedResponders[0].label === label) {
//       this.store.dispatch('setAllLegendActiveState', true);
//       this.activatedResponders = [];
//     } else {
//       this.store.dispatch('setAllLegendActiveState', false);
//       this.store.dispatch('setLegendActiveState', { name: label, active: true });
//       this.activatedResponders = responders;
//     }
//
//     this.eventBus.emit('needDraw');
//   };
//
//   initialize() {
//     this.type = 'legendPagination';
//     this.name = 'legendPagination';
//     // this.eventBus.on('clickLegendCheckbox', this.onClickCheckbox);
//     // this.eventBus.on('clickLegendLabel', this.onClickLabel);
//   }
//
//   render({ layout, legend, theme }: ChartState<Options>) {
//     // this.isShow = legend.visible && !!legend.data.length;
//     //
//     // if (!this.isShow) {
//     // }
//     // @TODO: stack 일 떄 라벨 순서 역순으로(스택이 쌓인 순서대로) 되어야
//     // const { showCheckbox, data: legendData } = legend;
//     // this.rect = layout.legend;
//     // this.theme = theme.legend as Required<LegendTheme>;
//     //
//     // // this.initColorAndIconTypeMap(legendData);
//     // // this.models = this.renderLegendModel(legend);
//     //
//     // const { data } = this.models[0];
//     // const checkboxResponder = this.makeCheckboxResponder(data, showCheckbox);
//     // const labelResponder = this.makeLabelResponder(data, showCheckbox);
//     //
//     // this.responders = [...checkboxResponder, ...labelResponder];
//   }
// }
