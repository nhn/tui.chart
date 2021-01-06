# Treemap Chart

> [API](./common-api.md) information regarding each chart is not addressed in this document. Refer to the API Guide. 

## Creating the Chart

There are two different ways to create the Treemap chart. The Treemap chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { TreemapChart } from '@toast-ui/chart';

const chart = new TreemapChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.treemapChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series` and must be a pair of either `label`-`data` or `label`-`children`. The `children` must be provided as an array, and it takes the lower data from the tree. The `data` must be a numeric value. 

```js
const data = {
  series: [
    {
      label: 'Documents',
      children: [
        {
          label: 'docs',
          children: [
            {
              label: 'pages',
              data: 1.3,
            },
            {
              label: 'keynote',
              data: 2.5,
            },
            {
              label: 'numbers',
              data: 1.2,
            },
          ],
        },
        {
          label: 'photos',
          data: 5.5,
        },
        {
          label: 'videos',
          data: 20.7,
        },
      ],
    },
    {
      label: 'Downloads',
      children: [
        {
          label: 'recents',
          data: 5.3,
        },
        {
          label: '2020',
          data: 10.1,
        },
        {
          label: '2019',
          data: 8.2,
        },
      ],
    },
    {
      label: 'Application',
      data: 16.4,
    },
    {
      label: 'Desktop',
      data: 4.5,
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101874502-5461e100-3bcc-11eb-8ce5-a44bdb8eee59.png)

## Color Value Chart

The entire series can be colored with respect to the value of the `data`. Instead of defining colors for each series, the `data` value can define a standard upon which the entire chart can be colored. This can be enabled through the `useColorValue` option and adding the `colorValue` to the data.

### Options

* default: `true`

```js
const options = {
  series: {
    useColorValue: true
  }
};
```

### Data Type

The data structure is the same as the basic charts but it takes in an additional value of `colorValue`. The `colorValue` is a numeric value. 

```js
const options = {
  series: [
    {
      label: 'Asia',
      children: [
        {
          label: 'South Korea',
          data: 99909,
          colorValue: 499.81,
        },
        {
          label: 'Japan',
          data: 364485,
          colorValue: 335.61,
        },
        {
          label: 'Jordan',
          data: 88802,
          colorValue: 86.07,
        },
        {
          label: 'Iraq',
          data: 437367,
          colorValue: 81.6,
        },
      ],
    },
    {
      label: 'Europe',
      children: [
        {
          label: 'UK',
          data: 241930,
          colorValue: 262.84,
        },
        {
          label: 'France',
          data: 640427,
          colorValue: 117.83,
        },
        {
          label: 'Hungary',
          data: 89608,
          colorValue: 106.54,
        },
        {
          label: 'Portugal',
          data: 91470,
          colorValue: 115.35,
        },
      ],
    },
    {
      label: 'America',
      children: [
        {
          label: 'Panama',
          data: 74340,
          colorValue: 52.81,
        },
        {
          label: 'Honduras',
          data: 111890,
          colorValue: 75.15,
        },
        {
          label: 'Uruguay',
          data: 175015,
          colorValue: 19.6,
        },
        {
          label: 'Cuba',
          data: 109820,
          colorValue: 101.47,
        },
      ],
    },
    {
      label: 'Africa',
      children: [
        {
          label: 'Malawi',
          data: 94080,
          colorValue: 146.09,
        },
        {
          label: 'Ghana',
          data: 227533,
          colorValue: 113.13,
        },
        {
          label: 'Togo',
          data: 54385,
          colorValue: 126.28,
        },
        {
          label: 'Benin',
          data: 114305,
          colorValue: 96.61,
        },
      ],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/101875569-30070400-3bce-11eb-848a-968f5eb3a73d.png)

## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
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
  series?: {
    useColorValue?: boolean;
    zoomable?: boolean;
    selectable?: boolean;

    dataLabels?: {
      useTreemapLeaf?: boolean;

      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
    }
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide. 
> (Links: 
> [`chart` Options](./common-chart-options.md),
> [Legend](./common-legend.md), 
> [Tooltip](./common-tooltip.md),
> [Export](./common-exportMenu.md),
> [`responsive` Options](./common-responsive-options.md), 
> [Data Label](./common-dataLabels-options.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/101877030-bb819480-3bd0-11eb-814d-eb2302e79245.png)

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

### zoomable

![zoomable_treemap](https://user-images.githubusercontent.com/35371660/101877249-0dc2b580-3bd1-11eb-85bb-4272711c6b5f.gif)

* default: `false`

zoomable can be used to zoom into the chart.

```js
const options = {
  series: {
    zoomable: true
  }
}
```
### dataLabel useTreemapLeaf

* default: `false`

Only expose the labels for the nodes in the current level of the tree when exposing data labels.

![image](https://user-images.githubusercontent.com/35371660/101877546-83c71c80-3bd1-11eb-9855-2a8a59fc641b.png)


To expose labels for nodes in the lower levels, set the `useTreemapLeaf` option to `true`. 

```js
const options = {
  series: {
    dataLabels: {
      visible: true,
      useTreemapLeaf: true
    }
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/101877499-701bb600-3bd1-11eb-9e24-03f989c0ab02.png)


## Series Theme

The following is a list of themes that can be modified in the Treemap chart.

```ts
interface TreemapChartSeriesTheme {
  colors?: string[];
  startColor?: string;
  endColor?: string;
  borderColor?: string;
  borderWidth?: number;
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  dataLabels?: {
    useSeriesColor?: boolean;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
    lineWidth?: number;
    textStrokeColor?: string;
    shadowColor?: string;
    shadowBlur?: number;
    textBubble?: {
      visible?: boolean;
      paddingX?: number;
      paddingY?: number;
      backgroundColor?: string;
      borderRadius?: number;
      borderColor?: string;
      borderWidth?: number;
      shadowColor?: string;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
      shadowBlur?: number;
    }
  };
}
```

| Name | Type | Details |
| --- | --- | --- |
| colors | string[] | The color of the series |
| startColor | string | The starting color that sets the standard when `useColorValue: true`. |
| endColor | string | The ending color that sets the standard when `useColorValue true`. |
| borderColor | string | The color of the series border | 
| borderWidth | number | The width of the series border |
| select | object | The style that is applied to the line when the series is selected and the `series.selectable` is set to `true`. |
| hover | object | The style that is applied when the user hovers over the data | 
| dataLabels | object | Data label style. For more information, refer to the DataLabels guide. | 


### startColor and endColor

These values set the standard. The `colorValue` is decided with respect to the `startColor` and `endColor` values. 

For a simple example, let's set the startColor to be `#4A76B2`,

![image](https://user-images.githubusercontent.com/35371660/101878940-d0135c00-3bd3-11eb-8070-9429df31d9c3.png)

and the endColor to be `#221271`. The higher colorValue will lead to a value that is closer to the endColor. 

![image](https://user-images.githubusercontent.com/35371660/101878968-dacdf100-3bd3-11eb-9e5a-587630ae3e02.png)

```js
const options = {
  series: {
    theme: {
      startColor: '#4A76B2',
      endColor: '#221271'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/35371660/101879101-22547d00-3bd4-11eb-9196-a308d24cd69c.png)