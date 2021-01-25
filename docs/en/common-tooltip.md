# Tooltip

Tooltip area displays information regarding the data on which the mouse is hovering.

![image](https://user-images.githubusercontent.com/35371660/102475501-482ec580-409d-11eb-839e-c4c4e56ce0b8.png)

The Tooltip area is divided into header area and the body area. The header area displays the category value, and the body area displays the data value.

## options

The following is a list of options that can be used to control the tooltip.

```ts
/* Tooltip options */
interface TooltipOptions {
  offsetX?: number;
  offsetY?: number;
  formatter?: (value) => string;
  template?: (
    model: TooltipTemplateModel,
    defaultTemplate: { header: string; body: string },
    theme: Required<TooltipTheme>
  ) => string;
  transition: boolean | string;
}

type TooltipTemplateModel = {
  data: {
    label: string;
    color: string;
    value: TooltipDataValue;
    formattedValue?: string;
    category?: string;
    percentValue?: number;
  }[];
  category?: string;
};
```

### offsetX, offsetY

The `offsetX` and `offsetY` options can be used to change the location of the tooltip.

- default
  - offsetX: `0`
  - offsetY: `0`

Given that the tooltip's original location is (0,0), a positive offsetX and a negative offsetY can move the tooltip in the North East direction.

```js
const options = {
  tooltip: {
    offsetX: 30,
    offsetY: -100,
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102179647-dca4f680-3eea-11eb-940d-2fd87dff0434.png)

### Formatter

The `tooltip.formatter` option can be used to format the data before the data is displayed. The formatting function takes the values and tooltip data information as parameters and returns the formatted string.

Let's write a simple example that compares the entered values and adds an emoji.

```js
const options = {
  tooltip: {
    formatter: (value, tooltipDataInfo) => {
      const temp = Number(value);
      let icon = '☀️';
      if (temp < 0) {
        icon = '❄️';
      } else if (temp > 25) {
        icon = '🔥';
      }

      console.log(tooltipDataInfo); // { category: '08/01/2020', color: '#785fff', index: 7, seriesIndex: 4, value: -0.1, label: 'Jungfrau'}

      return `${icon} ${value} ℃`;
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102180203-d2cfc300-3eeb-11eb-9197-280cb25654bb.png)

In this case, the given `value` is `-4.1` and the value is formatted according to our needs and is displayed.

### Custom tooltip

The custom tooltip can be designed using the `tooltip.template`. It takes a function that returns HTML string as a parameter. This function takes three parameters: data, original template, and the theme for the original template.

| Name | Type | Details |
| --- | --- | --- |
| model | object | Collection of data information used to activate the tooltip as an object. The first parameter of the function. |
| model.x | number | x coordinate of the data |
| model.y | number | y coordinate of the data |
| model.category | string | Category value of the data |
| model.label | string | Label value of the data |
| model.data | object | Collection of data as an object |
| model.data.category | string | Category value of the data |
| model.data.color | string | Color of the data series |
| model.data.formattedValue | string | Formatted value of the data |
| model.data.label | string | Label value of the data |
| model.data.value | Current chart's data type | Value of the data |
| defaultTooltipTemplate | object | Original HTML template object. Second parameter of the function. |
| defaultTooltipTemplate.header | string | HTML template for the header area where the category is displayed. |
| defaultTooltipTemplate.body | string | HTML template for the body area where the data is displayed. |
| theme | object | Theme used for the original tooltip. Third parameter of the function. More details are included in the tooltip theme chapter. |

Let's use these options to create a custom tooltip that uses a new header with the original body.

```js
const options = {
  tooltip: {
    template: (model, defaultTooltipTemplate, theme) => {
      const { body, header } = defaultTooltipTemplate;
      const { background } = theme;

      return `
        <div style="
          background: ${background};
          width: 140px;
          padding: 0 5px;
          text-align: center;
          color: white;
          ">
            <p>🎊 ${model.category} 🎊</p>
            ${body}
          </div>`;
      `
    }
  }
}
```

The result of the code above is shown below.

![image](https://user-images.githubusercontent.com/35371660/102183437-2f81ac80-3ef1-11eb-8ebb-438cc153de99.png)

### transition

`tooltip.transition` is an option to control the movement animation of the tooltip. Usage is the same as [CSS transition property](https://developer.mozilla.org/en-US/docs/Web/CSS/transition).

- default: `false`

The position of the tooltip is changed through the [`transform` property]((https://developer.mozilla.org/en-US/docs/Web/CSS/transform)), so the transition-property should be `transform`.
If the option is set to `true`, it moves to `transform 0.2s ease`.

Let's use these options to make a tooltip move more slowly.

```js
const options = {
  tooltip: {
    transition: 'transform 1s ease-in',
  },
};
```

![tooltip-transition](https://user-images.githubusercontent.com/35371660/105424970-c0376f00-5c8b-11eb-9539-51732688898b.gif)

## theme

The theme options that are currently provided for tooltip are as follows.

```ts
interface TooltipTheme {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  body?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```


| Name | Type | Details |
| --- | --- | --- |
| background | string | Background color |
| borderColor | string | Border line color |
| borderWidth | number | Border line width |
| borderStyle | string | Styles for the border line. Available options can be found in this [MDN link](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style). |
| borderRadius | number | Border rounding value |
| header | object | Styles for the tooltip header |
| body | object | Styles for the tooltip body |

Let's style the tooltip background with different colors and borders, for example.

```js
const options = {
  theme: {
    tooltip: {
      background: '#80CEE1',
      borderColor: '#3065AC',
      borderWidth: 10,
      borderRadius: 20,
      borderStyle: 'double',
    },
  },
};
```

The code above results as shown below.

![image](https://user-images.githubusercontent.com/35371660/102186142-84bfbd00-3ef5-11eb-8272-aa1093da0e98.png)
