import React from 'react';
import Chart, { CustomEventType } from '@toast-ui/chart';
import { ChartInstanceType, ChartProps, ChartType, ChartPropsType } from '../index';

export default function <T extends ChartPropsType>(chartType: ChartType) {
  return class ChartFactory extends React.Component<ChartProps<T>> {
    rootEl = React.createRef<HTMLDivElement>();

    chartInst: ChartInstanceType | null = null;

    getRootElement() {
      return this.rootEl.current;
    }

    getInstance() {
      return this.chartInst;
    }

    bindEventHandlers(props: ChartProps<T>, prevProps?: ChartProps<T>) {
      Object.keys(props)
        .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
        .forEach((key) => {
          const eventName = (key[2].toLowerCase() + key.slice(3)) as CustomEventType;
          if (prevProps && prevProps[key] !== props[key]) {
            // @TODO: need to implement
            // this.chartInst?.off(eventName);
          }
          this.chartInst?.on(eventName, this.props[key]);
        });
    }

    componentDidMount() {
      const { data, options } = this.props;
      this.chartInst = Chart[`${chartType}Chart`]({ el: this.rootEl.current, data, options });

      this.bindEventHandlers(this.props as ChartProps<T>);
    }

    shouldComponentUpdate(nextProps: ChartProps<T>) {
      const currentData = this.props.data;
      const nextData = nextProps.data as any; // @TODO: need to set type properly

      if (currentData !== nextData) {
        this.getInstance()?.setData(nextData);
      }

      this.bindEventHandlers(nextProps, this.props as ChartProps<T>);

      return false;
    }

    render() {
      return <div style={this.props.style} ref={this.rootEl} />;
    }
  };
}
