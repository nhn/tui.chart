## ![Toast UI Chart](https://cloud.githubusercontent.com/assets/7088720/21300155/e52f31ae-c5e4-11e6-8d6a-d660a48d0d50.png)

> 🍞🤹‍ Interactive Chart Library for JavaScript

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.grid/releases/latest) [![npm](https://img.shields.io/npm/v/tui-chart.svg)](https://www.npmjs.com/package/tui-grid) [![bower](https://img.shields.io/bower/v/tui-chart.svg)](https://github.com/nhnent/tui.grid/releases/latest) [![GitHub license](https://img.shields.io/github/license/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.grid/blob/production/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.chart/pulls) [![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

![2018-01-22 11 26 06](https://github.nhnent.com/storage/user/998/files/cc15f89c-ff86-11e7-8daf-718e2907a38c)

## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Features & Examples](#-features)
* [Install](#-install)
  * [Package Installs](#package-installs)
  * [Installing from source](#installing-from-source)
* [Load](#-load)
    * [namespace](#namespace)
    * [modules](#modules)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#-development)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)

## 🌏 Browser Support
|<img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE / Edge" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="IE / Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari |
| --- | --- | --- | ---- | --- |
| 8+ | Yes | Yes | Yes | Yes |


## 🎨 Features & Examples

* [Bar Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html)
* [Column Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example02-01-column-chart-basic.html)
* [Line Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example03-01-line-chart-basic.html)
* [Area Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example04-01-area-chart-basic.html)
* [Bubble Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example05-01-bubble-chart-basic.html)
* [Scatter Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example06-01-scatter-chart-basic.html)
* [Pie Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example07-01-pie-chart-basic.html)
* [Radial Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example13-01-radial-chart-basic.html)
* [Boxplot Chart](https://nhnent.github.io/tui.chart/latest/tutorial-example14-01-boxplot-chart-basic.html)


## Map Data Attribution
* [https://www.amcharts.com/svg-maps/](https://www.amcharts.com/svg-maps/)

## 💾 Install

### Dependencies

TOAST UI Chart have `external` dependencies on these libraries. These means before loading TOAST UI Chart, you need to download these and load it.

* [raphael](https://github.com/nhnent/raphael)
* [tui.code-snippet](https://github.com/nhnent/tui.code-snippet)

### Package Installs

#### npm
``` sh
$ npm install --save tui-chart # latest version
$ npm install --save tui-chart@<version> # specific version
```

#### bower

``` sh
$ bower install tui-chart # latest version
$ bower install tui-chart#<tag> # specific version
```

### Installing from Source

#### CDN

* [chart.js](https://rawgit.com/nhnent/tui.chart/v2.14.0/dist/tui-chart.js)
* [chart.css](https://rawgit.com/nhnent/tui.chart/v2.14.0/dist/tui.chart.css)

#### Download Manually

* [Download bundle files](https://github.com/nhnent/tui.chart/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.chart/releases)

## Load

### namespace

```html
<script src="./path/to/raphael.js"></script>
<script src="./path/to/tui-code-snippet.js"></script>
<script src="./path/to/tui-chart.js"></script>
<script>
    tui.chart.barChart(...);
</script>
```

### module

```javascript
import {chart} from 'tui-chart';

chart.barChart(...);
```

## 🔨 Usage

### HTML

Add the container element where TOAST UI Chart will be created.

``` html
<div id="chart"></div>
```

### JavaScript

``` javascript
var container = document.getElementById('chart-area');
var data = {
    category: [...], series: [...]
};
var options = {
    chart: {width: 700, height: 400}
};

chart.barChart(container, data, options);
```

See [details](https://nhnent.github.io/nhnent/tui.chart/latest) for additional informations.

## 🔧 Development

``` sh
# Setup
$ git clone https://github.com/nhnent/tui.chart.git
$ cd tui.chart
$ npm install

# test
$ npm run test

# local server
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8

# bundle
$ npm run deploy
```

## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.chart/wiki/Getting-Started)
* [Tutorials](https://github.com/nhnent/tui.chart/wiki)
* [APIs](https://nhnent.github.io/tui.chart/api)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.chart/releases).

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Issue guideline](ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🍞 TOAST UI Family
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Grid](https://github.com/nhnent/tui.grid)
* [TOAST UI Components](https://github.com/nhnent)

## 📜 License
This software is licensed under the [MIT](https://github.com/nhnent/tui.chart/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
