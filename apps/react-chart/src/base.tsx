import React from 'react';
import Chart from '@toast-ui/chart';
// import { ChartType, Options } from '@toast-ui/chart/types/store/store';
// import { Chart } from '@toast-ui/chart/types';

type ChartFactoryType = 'nestedPie' | 'lineScatter' | 'lineArea' | 'columnLine';

// type 지정 필요
interface ChartProps {
  style: Record<string, string>;
  data: any;
  options: any;
}

export default function (chartType: ChartFactoryType) {
  return class ChartFactory extends React.Component<ChartProps> {
    rootEl = React.createRef<HTMLDivElement>();

    chartInst: Chart | null = null;

    getRootElement() {
      return this.rootEl.current;
    }

    getInstance() {
      return this.chartInst;
    }

    bindEventHandlers(props: ChartProps, prevProps?: ChartProps) {
      Object.keys(props)
        .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
        .forEach((key) => {
          // const eventName = (key[2].toLowerCase() + key.slice(3)) as CustomEventType;
          if (prevProps && prevProps[key] !== props[key]) {
            // @TODO: need to implement
            // this.chartInst?.off(eventName);
          }
          // this.chartInst?.on(eventName, this.props[key]);
        });
    }

    componentDidMount() {
      const { data, options } = this.props;
      this.chartInst = Chart[`${chartType}Chart`]({ el: this.rootEl.current, data, options });

      this.bindEventHandlers(this.props);
    }

    shouldComponentUpdate(nextProps) {
      const currentData = this.props.data;
      const nextData = nextProps.data;

      if (currentData !== nextData) {
        // this.getInstance()?.setData(nextData);
      }

      this.bindEventHandlers(nextProps, this.props);

      return false;
    }

    render() {
      return <div style={this.props.style} ref={this.rootEl} />;
    }
  };
}
