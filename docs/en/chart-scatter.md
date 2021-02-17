# Scatter Chart

> [API](./common-api.md) information regarding each chart is not addressed in this document. Refer to the API Guide.

## Creating the Chart

There are two different ways to create the Scatter chart. The Scatter chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { ScatterChart } from '@toast-ui/chart';

const chart = new ScatterChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.scatterChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series`. Each series must be completed with both `name` and `data`, and the data must include the `x`, `y` coordinates.

```js
const data = {
  series: [
    {
      name: 'male',
      data: [
        { x: 174, y: 65.6 },
        { x: 175.3, y: 71.8 },
        { x: 193.5, y: 80.7 },
        { x: 186.5, y: 72.6 },
        { x: 187.2, y: 78.8 },
      ],
    },
    {
      name: 'female',
      data: [
        { x: 161.2, y: 51.6 },
        { x: 167.5, y: 59 },
        { x: 159.5, y: 49.2 },
        { x: 157, y: 63 },
        { x: 155.8, y: 53.6 },
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/102057191-e4a06000-3e30-11eb-8396-378ae2a8f7ec.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  series: [
    {
      name: 'male',
      data: [
        { x: 174, y: 65.6 },
        { x: 175.3, y: 71.8 },
        { x: 193.5, y: 80.7 },
        { x: 186.5, y: 72.6 },
        { x: 187.2, y: 78.8 },
      ],
      visible: false,
    },
    {
      name: 'female',
      data: [
        { x: 161.2, y: 51.6 },
        { x: 167.5, y: 59 },
        { x: 159.5, y: 49.2 },
        { x: 157, y: 63 },
        { x: 155.8, y: 53.6 },
      ],
    },
  ],
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108012165-07770c80-704c-11eb-9efd-e3042647afea.png)

## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    //...
  }
  xAxis?: {
    //...
  }
  yAxis?: {
    //...
  }
  legend?: {
    //...
  }
  exportMenu?: {
    //...
  }
  tooltip?: {
    //...
  }
  responsive?: {
    //...
  }
  plot?: {
    //...
  }
  theme?: {
    // More explanations in the `theme` chapter.
  }
  series?: {
    selectable?: boolean;
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axis](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [`responsive` Options](./common-responsive-options.md),
> [Live Update](./common-liveUpdate-options.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/102058051-457c6800-3e32-11eb-9399-3252f9d4ada5.png)

* default: `false`

Makes the series selectable.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

## Series Theme

The following is a list of themes that can be modified in the Scatter chart.

```ts
interface BubbleChartSeriesTheme {
  iconTypes?: (
    | 'circle'
    | 'rect'
    | 'triangle'
    | 'pentagon'
    | 'star'
    | 'diamond'
    | 'cross'
    | 'hexagon'
  )[];
  borderWidth?: number;
  fillColor?: string;
  size?: number;
  colors?: string[];
  select?: {
    size?: number;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    size?: number;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}
```

| Name | Type | Details |
| --- | --- | --- |
| iconTypes | array | Can be used to define icon types for the series. Default value is `circle` and is an array. |
| borderWidth | number | The width of the series border |
| fillColor | string | The background color of the series |
| size | number | The size of the series |
| colors | string[] | The color of the series |
| select | object | The style that is applied to the line when the series is selected and the `series.selectable` is set to `true`. |
| hover | object | The style that is applied when the user hovers over the data |

The theme can be added through the `theme` value in the options object. For example, let's change the icon of the series.

```js
const options = {
  theme: {
    series: {
      iconTypes: ['star', 'diamond'],
    },
  },
}
```

The result of the above option is shown as shown below.

![image](https://user-images.githubusercontent.com/35371660/102059371-2bdc2000-3e34-11eb-9b3a-dea995fc8d73.png)
