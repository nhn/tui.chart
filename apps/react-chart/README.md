# TOAST UI Chart for React

> This is a React component wrapping [TOAST UI Chart](https://github.com/nhn/tui.chart).

[![github version](https://img.shields.io/github/release/nhn/toast-ui.react-chart.svg)](https://github.com/nhn/toast-ui.react-chart/releases/latest)
[![npm version](https://img.shields.io/npm/v/@toast-ui/react-chart.svg)](https://www.npmjs.com/package/@toast-ui/react-chart)
[![license](https://img.shields.io/github/license/nhn/toast-ui.vue-chart.svg)](https://github.com/nhn/toast-ui.react-chart/blob/master/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhn/toast-ui.react-chart/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with hearth by NHN](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN-ff1414.svg)](https://github.com/nhn)

## 🚩 Table of Contents
* [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
* [Install](#-install)
    * [Using npm](#using-npm)
* [Usage](#-usage)
    * [Import](#Import)
    * [Components](#components)
    * [Props](#props)
    * [Instance Methods](#Instance-Methods)
    * [Getting the root element](#Getting-the-root-element)
    * [Static Methods](#Static-Methods)
    * [Event](#event)
* [Pull Request Steps](#-pull-request-steps)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [License](#-license)

## Collect statistics on the use of open source

React Wrapper of TOAST UI Chart applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Chart is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the `usageStatistics` props like the example below.

```js
var options = {
    ...
    usageStatistics: false
}
```

Or, include `tui-code-snippet.js` (**v1.4.0** or **later**) and then immediately write the options as follows:

```js
tui.usageStatistics = false;
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/react-chart
```

## 📊 Usage

### Import

You can use Toast UI Chart for React as a ECMAScript module or a CommonJS module. As this module does not contain CSS files, you should import `tui-chart.css` from `tui-chart` manually. Also, map files are not included, so if you want to use a map chart, you have to import map files in the same way.

* Using ECMAScript module

    ```js
    import 'tui-chart/dist/tui-chart.css'
    import {BarChart, LineChart} from '@toast-ui/react-chart'
    ```

* Using CommonJS module

    ```js
    require('tui-chart/dist/tui-chart.css');
    var toastui = require('@toast-ui/react-chart');
    var BarChart = toastui.BarChart;
    var LineChart = toastui.LineChart;
    ```

* Using map files

    ```js
    import 'tui-chart/dist/maps/south-korea';
    import {MapChart} from '@toast-ui/react-chart';
    ```

### Components

You can use [all kinds of charts in tui.chart](https://github.com/nhn/tui.chart#-features). React Components for each chart types are:

* `BarChart`
* `ColumnChart`
* `LineChart`
* `AreaChart`
* `BubbleChart`
* `ScatterChart`
* `PieChart`
* `ComboChart`
* `MapChart`
* `HeatMapChart`
* `TreeMapChart`
* `RadialChart`
* `BoxPlotChart`
* `BulletChart`

### Props

[All the options of the TOAST UI Chart](http://nhn.github.io/tui.chart/latest/) are supported in the form of props. Note that data and columns props are required and other props are optional.

```js
const data = {
  categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
      {
          name: 'Budget',
          data: [5000, 3000, 5000, 7000, 6000, 4000]
      },
      {
          name: 'Income',
          data: [8000, 1000, 7000, 2000, 5000, 3000]
      }
  ]
};

const options = {
  chart: {
        width: 1160,
        height: 650,
        title: 'Monthly Revenue',
        format: '1,000'
    },
    yAxis: {
        title: 'Month'
    },
    xAxis: {
        title: 'Amount',
        min: 0,
        max: 9000,
        suffix: '$'
    },
    series: {
        showLabel: true
    }
};

const MyComponent = () => (
  <BarChart
    data={data} 
    options={options} 
  />
);
```

| Name | Type | Required | Description |
| --- | --- | --- | --- | 
| data | Object | O | This prop is for data of the chart. When you change data, chart is rendering for changing data. |
| options | Object | X | This prop is for options of tui.chart. You can configuration about chart. |

### Instance Methods

For using [instance methods of TOAST UI Chart](https://nhn.github.io/tui.date-picker/latest/DatePicker.html#.createCalendar), first thing to do is creating Refs of wrapper component using [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs). But the wrapper component does not provide a way to call instance methods of TOAST UI Chart directly. Instead, you can call `getInstance()` method of the wrapper component to get the instance, and call the methods on it.

```js
class MyComponent extends React.Component {
  chartRef = React.createRef();
  
  handleClickButton = () => {
    console.log('type:', this.chartRef.current.getInstance().getType());
  }

  render() {
    return (
      <>
        <BarChart 
          ref={this.chartRef}
          data={data} 
          options={options} 
        />
        <button onClick={this.handleClickButton}>getType</button>
      </>
    );
  }
}
```

### Getting the root element

An instance of the wrapper component also provides a handy method for getting the root element. If you want to manipulate the root element directly, you can call `getRootElement` to get the element.

```js
class MyComponent extends React.Component {
  chartRef = React.createRef();
  
  handleClickButton = () => {
    this.chartRef.current.getRootElement().classList.add('my-chart-root');
  }

  render() {
    return (
      <>
        <BarChart 
          ref={this.chartRef}
          data={data} 
          options={options} 
        />
        <button onClick={this.handleClickButton}>Click!</button>
      </>
    );
  }
}
```

### Static Methods

The wrapper component does not provide a way to call [static methods of TOAST UI Chart](http://nhn.github.io/tui.chart/latest/tui.chart.html). If you want to use static methods such as `registerMap`, `registerPlugin` or `registerTheme` you should use it via importing `tui-chart` directly.

```js
import TuiChart from 'tui-chart';

TuiChart.registerTheme('myTheme', myTheme);
```

### Event

[All the events of TOAST UI Chart](https://github.com/nhn/toast-ui.react-chart/blob/master/docs/getting-started.md#event) are supported in the form of `on[EventName]` props. The first letter of each event name should be capitalized. For example, for using `click` event you can use `onClick` prop like the example below.

```js
class MyComponent extends React.Component {
  handleClick = () => {
    console.log('click!!');
  }

  render() {
    return (
      <BarChart 
        data={data} 
        columns={columns} 
        onSelectLegend={this.handleClick}
      />
    );
  }
}
```

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/[[repo name]].git
$ cd [[repo name]]
$ npm install
```

### Develop

Let's start development!

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 📙 Documents
* [Getting Started](https://github.com/nhn/toast-ui.react-chart/blob/master/docs/getting-started.md)

## 💬 Contributing
* [Code of Conduct](https://github.com/nhn/toast-ui.react-chart/blob/master/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhn/toast-ui.react-chart/blob/master/CONTRIBUTING.md)
* [Commit convention](https://github.com/nhn/toast-ui.react-chart/blob/master/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License
This software is licensed under the [MIT](./LICENSE) © [NHN.](https://github.com/nhn)
