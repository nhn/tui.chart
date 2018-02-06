## ![Toast UI Chart](https://cloud.githubusercontent.com/assets/7088720/21300155/e52f31ae-c5e4-11e6-8d6a-d660a48d0d50.png)

> 🍞🍯 Spread your data on TOAST UI Chart. TOAST UI Chart is Statistical Data Visualization library for javascript

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.grid/releases/latest) [![npm](https://img.shields.io/npm/v/tui-chart.svg)](https://www.npmjs.com/package/tui-grid) [![bower](https://img.shields.io/bower/v/tui-chart.svg)](https://github.com/nhnent/tui.chart/releases/latest) [![GitHub license](https://img.shields.io/github/license/nhnent/tui.chart.svg)](https://github.com/nhnent/tui.chart/blob/production/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.chart/pulls) [![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

![area chart normal stack2](https://user-images.githubusercontent.com/13758710/35846361-b9b96dd0-0b59-11e8-8e55-57995e35badc.png)
![all](https://user-images.githubusercontent.com/13758710/35847300-6139bcec-0b5d-11e8-861f-57d8a0b1c810.png)


## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Features](#-features)
* [Demos & Examples](#-demos-examples)
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
|<img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari |
| --- | --- | --- | ---- | --- |
| 8+ | Yes | Yes | Yes | Yes |


## 🎨 Features

TOAST UI Chart is a Charting library written for plain JavaScript.

### Great design, but also Customizable

Clear design helps your data to be clarified, easy to understand.  
With TOAST UI Chart, you don't need to think of design. A pretty chart is drawn as soon as you put the data.  

Of course, you can customize design easily.  
Using options and themes, you can customize title, legend, axes, series, tooltips, and plots.  
[Here](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/theme.md) is some some guides about customizing styles.

### VanilaJS, SVG, IE8+

It is a pure VanilaJS library. No dependencies on any frontend frameworks.  
Dissappoint it? Contribute for framework wrappers! PR is always welcomed.  

As it is SVG based chart, independent for resolution. Always clean vector graphic.  

Supports all your possible customers, using IE8+, and latest modern browsers.

### Maintained Actively, fast feedback!

Did not find any features what you want? Asking us! We will make it.  
It is being maintained actively for three years and so forth.  

### Under MIT License. Free for commercial use

Yes, It's free. :)

## Demos

* Single Charts

  | [Bar](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html)<br>[Column](https://nhnent.github.io/tui.chart/latest/tutorial-example02-01-column-chart-basic.html) | [Line](https://nhnent.github.io/tui.chart/latest/tutorial-example03-01-line-chart-basic.html)<br>[Area](https://nhnent.github.io/tui.chart/latest/tutorial-example04-01-area-chart-basic.html)<br>[Radial](https://nhnent.github.io/tui.chart/latest/tutorial-example13-01-radial-chart-basic.html) | [Bubble](https://nhnent.github.io/tui.chart/latest/tutorial-example05-01-bubble-chart-basic.html)<br>[Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example06-01-scatter-chart-basic.html) | [Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-01-pie-chart-basic.html)(General)<br>[Pie](https://nhnent.github.io/tui.chart/latest/tutorial-example07-04-pie-chart-donut.html)(Donut) | [Map](https://nhnent.github.io/tui.chart/latest/tutorial-example09-01-map-chart-world-map.html)<br>[Heatmap](https://nhnent.github.io/tui.chart/latest/tutorial-example10-01-heatmap-chart-basic.html)<br>[Treemap](https://nhnent.github.io/tui.chart/latest/tutorial-example11-01-treemap-chart-basic.html) | [Boxplot](https://nhnent.github.io/tui.chart/latest/tutorial-example14-01-boxplot-chart-basic.html) | [Bullet](https://nhnent.github.io/tui.chart/latest/tutorial-example15-01-bullet-chart-basic.html)
  | --- | --- | --- | --- | --- | --- | --- |

* Combo Charts

  | [Column-Line](https://nhnent.github.io/tui.chart/latest/tutorial-example08-01-combo-chart-column-and-line.html) | [Pie-Donut](https://nhnent.github.io/tui.chart/latest/tutorial-example08-02-combo-chart-pie-and-donut.html) | [Line-Area](https://nhnent.github.io/tui.chart/latest/tutorial-example08-03-combo-chart-line-and-area.html) | [Line-Scatter](https://nhnent.github.io/tui.chart/latest/tutorial-example08-04-combo-chart-line-and-scatter.html) |
  | --- | --- | --- | --- |

## Examples

* [Load Data from <table>](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/import-chart-data-from-existing-table-element.md)
* [Add data dynamically](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/theme.md)
* [Apply themes](https://nhnent.github.io/tui.chart/latest/tutorial-example12-01-dynamic-chart-append-and-shift-data-dynamically.html)

Find more on [Example](https://nhnent.github.io/tui.chart/latest/tutorial-example01-01-bar-chart-basic.html) and [wiki](https://github.com/nhnent/tui.chart/tree/production/docs/wiki#tutorial) pages.

## Dependencies

* [raphael](https://github.com/nhnent/raphael)
* [tui.code-snippet](https://github.com/nhnent/tui.code-snippet)

## Map Data Attribution
* [https://www.amcharts.com/svg-maps/](https://www.amcharts.com/svg-maps/)

## 💾 Install

TOAST UI products provides 4 install(or loading) options: bower, npm, CDN, and manual download.

### via Package Manager

Package manager is a remote package storages. With a few commands, you can download any version at anywhere. Also, dependent packages are downloaded togather. You don't need to download these packages at each.

TOAST UI Chart is published on two package managers: bower and npm.
Node enviromnent and using module pattern, `npm` is recommended.
Bower also supported. As it will be deprecated, you will changed to `npm` in the future.

#### npm
``` sh
$ npm install --save tui-chart # latest version
$ npm install --save tui-chart@<version> # specific version
```

#### bower
``` sh
$ bower install --save tui-chart # latest version
$ bower install --save tui-chart#<version> # specific version
```

### Installing from Source

#### CDN

* [chart.js](https://rawgit.com/nhnent/tui.chart/v2.14.0/dist/tui-chart.js)
* [chart.css](https://rawgit.com/nhnent/tui.chart/v2.14.0/dist/tui.chart.css)

#### Manual Download

* [Download bundle files](https://github.com/nhnent/tui.chart/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.chart/releases)

## Load

When loading sources using `<script>` tag. Take care of dependency libraries. Dependencies should be on before TOAST UI Chart bundle file. Script tag bring sources into global environment. `tui.chart` is namespace of TOAST UI Chart to prevent namespace pollution.

However, at the module system, you don't need to think of dependencies. It will download dependencies when you install TOAST UI Chart.

Below is the sample for how to references TOAST UI Chart.
In this sample, we are using bar chart factory function.


### script

```html
/* scripts loading */
<script src="./path/to/raphael.js"></script>
<script src="./path/to/tui-code-snippet.js"></script>
<script src="./path/to/tui-chart.js"></script>
/* development using TOAST UI Chart */
<script> 
    /* namespace: tui.chart */
    tui.chart.barChart(...); 
</script>
```

### module

#### ES6

```javascript
/* no concern on dependencies */
import {chart} from 'tui-chart';

/* use it */
chart.barChart(...);
```

#### CommonJS

```javascript
/* no concern on dependencies */
var chart = require('tui-chart');

/* use it */
chart.barChart(...);
```

## 🔨 Usage

### HTML

Add the container element where TOAST UI Chart will be created.

``` html
<div id="chart"></div>
```

### JavaScript

Factory function needs three paramters: container, data, options

* Container: Wrapper HTMLElements that will contain charts as a child
* data: numeric data need to make charts
* options: functional options like legend aligment or tooltip visiblities

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

## 🔧 Pull Request Steps

### Setup
Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules. Build TOAST UI Chart then check if it has no errors before starts development.

``` sh
$ git clone https://github.com/{your-personal-repo}/tui.chart.git
$ cd tui.chart
$ npm install
$ npm run deploy
$ npm run test
```

### Develop
Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.
```sh
# local server
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8

# test
$ npm run test
```

### Pull requests
Before PR, check build lastly and then check any errors.
If it has no error, commit and then push it!
```sh
$ npm run deploy
$ npm run test
```

## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.chart/blob/production/docs/wiki/README.md)
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
