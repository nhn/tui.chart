import Component from './component';

export default class Outline extends Component {
  initialize() {
    this.type = 'outline';
    this.name = 'outline';
  }

  render(chartState) {
    const { series } = chartState;
    this.models = series;
    // 여기 렌더의 단계가 필요한가?
  }
}
