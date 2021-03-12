import React, { useRef } from 'react';
import '@toast-ui/chart/dist/toastui-chart.min.css';
import { LineChart } from '../src';
import { temperatureData } from './data';

export default {
  title: 'Options',
};

export const event = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
    },
    xAxis: {
      pointOnColumn: true,
    },
    series: {
      spline: true,
      showDot: true,
      selectable: true,
    },
  };

  function onHoverSeries(ev) {
    console.log(ev, 'hover!');
  }

  function onSelectSeries(ev) {
    console.log(ev, 'select!');
  }

  return (
    <LineChart
      options={options}
      data={temperatureData}
      onHoverSeries={onHoverSeries}
      onSelectSeries={onSelectSeries}
    />
  );
};

export const method = () => {
  const options = {
    chart: {
      height: 500,
      width: 1000,
    },
    xAxis: {
      pointOnColumn: true,
    },
    series: {
      spline: true,
      showDot: true,
      selectable: true,
    },
  };

  const chartRef = useRef(null);

  function showSeriesDataLabel() {
    chartRef.current.getInstance().showSeriesDataLabel();
  }

  function hideSeriesDataLabel() {
    chartRef.current.getInstance().hideSeriesDataLabel();
  }

  return (
    <>
      <LineChart ref={chartRef} options={options} data={temperatureData} />
      <button onClick={showSeriesDataLabel}>show label</button>
      <button onClick={hideSeriesDataLabel}>hide label</button>
    </>
  );
};

export const responsive = () => {
  const options = {
    chart: {
      height: 'auto',
      width: 'auto',
    },
    xAxis: {
      pointOnColumn: true,
    },
  };

  const containerStyle = {
    width: '80vw',
    height: '70vh',
  };

  return <LineChart style={containerStyle} options={options} data={temperatureData} />;
};
