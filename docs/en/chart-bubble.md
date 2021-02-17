# Bubble Chart

> [API](./common-api.md) information regarding each chart is not addressed in this document. Refer to the API Guide.

## Creating the Chart

There are two different ways to create the Bubble chart. The Bubble chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { BubbleChart } from '@toast-ui/chart';

const chart = new BubbleChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.bubbleChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series`. Each series must be completed with the `name` and the `data`, and the data must include `x`,`y` coordinates, radius `r`, and the label `label`.

```js
const data = {
  series: [
    {
      name: 'Africa',
      data: [
        { x: 30, y: 100, r: 10, label: 'Morocco' },
        { x: 40, y: 200, r: 30, label: 'Egypt' },
      ],
    },
    {
      name: 'America',
      data: [
        { x: 60, y: 40, r: 50, label: 'Canada' },
        { x: 50, y: 300, r: 10, label: 'United States' },
      ],
    },
    {
      name: 'Asia',
      data: [
        { x: 10, y: 150, r: 20, label: 'Korea, South' },
        { x: 20, y: 200, r: 30, label: 'Singapore' },
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/102034986-abe99200-3e02-11eb-85d7-5128b90e2999.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  series: [
    {
      name: 'Africa',
      data: [
        { x: 30, y: 100, r: 10, label: 'Morocco' },
        { x: 40, y: 200, r: 30, label: 'Egypt' },
      ],
      visible: false,
    },
    {
      name: 'America',
      data: [
        { x: 60, y: 40, r: 50, label: 'Canada' },
        { x: 50, y: 300, r: 10, label: 'United States' },
      ],
    },
    {
      name: 'Asia',
      data: [
        { x: 10, y: 150, r: 20, label: 'Korea, South' },
        { x: 20, y: 200, r: 30, label: 'Singapore' },
      ],
    },
  ],
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108008117-e8c04800-7042-11eb-8feb-6dd18593b00c.png)

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
  theme?: {
    // More explanations in the `theme` chapter.
  }
  circleLegend?: {
    visible?: boolean;
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

![image](https://user-images.githubusercontent.com/35371660/102035488-d425c080-3e03-11eb-9ebc-f974e4c7bb97.png)

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

### circleLegend

![image](https://user-images.githubusercontent.com/35371660/102035570-ff101480-3e03-11eb-9e73-bbb43e4b1353.png)

The Bubble chart can include a circle legend as shown in the image above. To make the legend invisible, use the `circleLegend.visible` option.

```js
const options = {
  circleLegend: {
    visible: false,
  },
}
```

![image](https://user-images.githubusercontent.com/35371660/102035692-6332d880-3e04-11eb-80fa-c4f2df8be421.png)


## Series Theme

The following is a list of themes that can be modified in the Bubble chart.

```ts
interface BubbleChartSeriesTheme {
  borderWidth?: number;
  borderColor?: string;
  colors?: string[];
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  }
}
```
| Name | Type | Details |
| --- | --- | --- |
| borderWidth | number | The width of the series border |
| borderColor | string | The color of the series border |
| colors | string[] | The color of the series |
| select | object | The style that is applied to the line when the series is selected and the `series.selectable` is set to `true`. |
| hover | object | The style that is applied when the user hovers over the data |

The theme can be added through the `theme` value in the options object. For example, let's change the border width and the border color for a selected series.

```js
const options = {
  theme: {
    series: {
      borderWidth: 4,
      borderColor: '#aabbcc'
    }
  }
}
```

The result of the above option is shown as shown below.

![image](https://user-images.githubusercontent.com/35371660/102056271-773fff80-3e2f-11eb-8aec-157d1e172324.png)
