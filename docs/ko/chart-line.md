# Line 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Line 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스를 반환한다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체 형태로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { LineChart } from '@toast-ui/chart';

const chart = new LineChart({el, data, options});

// 혹은 

import Chart from '@toast-ui/chart';

const chart = Chart.lineChart({el, data, options});
```

`data`는 카테고리값과 데이터를 넣어주는 방법과 좌푯값을 넣어주는 방법이 있다. 두 가지 방법을 차례대로 살펴보자.

## 기본 차트

### 데이터 타입

`categories` 값은 x축의 틱에 나타나며 `series` 값은 `name`-`data`가 모두 작성된 데이터가 입력되어야 한다. `name`은 각각의 시리즈를 구분하는 id의 목적으로 유일하게 작성해야 한다. 

```js
const data = {
  categories: [
    '01/01/2020',
    '02/01/2020',
    '03/01/2020',
    '04/01/2020',
    '05/01/2020',
    '06/01/2020',
    '07/01/2020',
    '08/01/2020',
    '09/01/2020',
    '10/01/2020',
    '11/01/2020',
    '12/01/2020',
  ],
  series: [
    {
      name: 'Seoul',
      data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 25.9, 27.2, 24.4, 13.9, 6.6, -0.6],
    },
    {
      name: 'Seattle',
      data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.6, 3.7],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101846479-5f008400-3b94-11eb-8670-198074d97999.png)

## 좌표 차트

좌표를 입력하는 방법은 두 가지가 존재한다. 객체 형태(`{x: value, y: value}`)로 전달하는 방법과 배열로 전달(`[x, y]`)하는 방법이다. 

먼저 객체 형태의 좌표 데이터를 통해 차트를 그려보자.

```js
const data = {
  series: [
    {
      name: 'SiteA',
      data: [
        { x: 1, y: 202 },
        { x: 7, y: 350 },
        { x: 8, y: 213 },
        { x: 9, y: 230 },
        { x: 12, y: 230 },
      ],
    },
    {
      name: 'SiteB',
      data: [
        { x: 1, y: 312 },
        { x: 3, y: 320 },
        { x: 7, y: 300 },
        { x: 9, y: 320 },
        { x: 13, y: 20 },
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101847254-28c40400-3b96-11eb-8f83-b1abe66704ab.png)

동일한 형태의 차트를 배열 형태의 데이터로 그릴 수 있다.

```js
const data = {
  series: [
    {
      name: 'SiteA',
      data: [
        [1, 202],
        [7, 350],
        [8, 213],
        [9, 230],
        [12, 230],
      ],
    },
    {
      name: 'SiteB',
      data: [
        [1, 312],
        [3, 320],
        [7, 300],
        [9, 320],
        [13, 20],
      ],
    },
  ],
};
```

## 옵션

`options`는 객체 형태로 작성한다.

```ts
type options = {
  chart?: {
    // ...
  },
  xAxis?: {
    // ...
  },
  yAxis?: {
    // ...
  },
  legend?: {
    // ...
  },
  exportMenu?: {
    // ...
  },
  tooltip?: {
    // ...
  },
  plot?: {
    // ...
  },
  responsive?: {
    // ...
  },
  theme?: {
    // 아래 테마 챕터에서 설명
  },
  series?: {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    eventDetectType?: 'near' | 'nearest' | 'grouped';
    shift?: boolean;
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto' | 'outer';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    }
  }
};
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크: 
> [axes](./common-axes.md), 
> [axes](./common-legend.md), 
> [tooltip](./common-tooltip.md),
> [plot](./common-plot.md), 
> [responsive](./common-responsive-options.md), 
> [live update](./common-liveUpdate-options.md)
> [dataLabels](./common-dataLables.md)
> )
### selectable

![image](https://user-images.githubusercontent.com/35371660/101849744-acccba80-3b9b-11eb-838c-40324d596afb.png)

* default: `false`

해당 시리즈를 선택할 수 있다.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.


### pointOnColumn

![image](https://user-images.githubusercontent.com/35371660/101850121-76dc0600-3b9c-11eb-867d-3bc47bd476f7.png)

* default: `false`

x축을 기준으로 시리즈의 시작 부분을 틱과 틱 가운데로 이동시킬 수 있다.

```js
const options = {
  xAxis: {
    pointOnColumn: true
  }
}
```

### spline

![image](https://user-images.githubusercontent.com/35371660/101850252-c02c5580-3b9c-11eb-9917-094e35c6b139.png)

* default: `false`

시리즈 선을 부드러운 spline 곡선으로 만들 수 있다. 

```js
const options = {
  series: {
    spline: true
  }
}
```

### eventDetectType

![image](https://user-images.githubusercontent.com/35371660/101850828-e0a8df80-3b9d-11eb-9500-98b351bd007e.png)

* default: `nearest`

툴팁에 나타낼 데이터를 탐지하는 방법을 정의할 수 있다.


| 타입 | 설명 |
| --- | --- |
| `near` | 데이터 영역의 일정 범위에 마우스가 다가가야 탐지. 일정 영역 내에 여러 데이터가 있을 경우 모두 한꺼번에 탐지됨 |
| `nearest` | 차트 내 모든 영역에서 이벤트 탐지. 마우스를 기준으로 가장 가까운 시리즈가 탐지 됨  |
| `grouped` | x축을 기준으로 값이 같은 모든 데이터가 탐지됨 | 

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```
### zoomable

![zoomable](https://user-images.githubusercontent.com/35371660/101851395-d2a78e80-3b9e-11eb-9255-4d8d3bcf75ec.gif)

* default: `false`

zoomable을 통해 차트를 확대 할 수 있다.

```js
const options = {
  series: {
    zoomable: true
  }
}
```
### secondary Y Axis
![image](https://user-images.githubusercontent.com/35371660/101852183-64fc6200-3ba0-11eb-976a-3d4cfbb4b5a8.png)

`yAxis`의 옵션값을 배열 형태로 넣을 경우 우측에 두 번째 y축을 지정할 수 있다. 입력되는 순서에 따라 첫 번째가 주축, 두번째 값이 두 번째 secondaryYAxis가 된다.

```js
const options = {
  yAxis: [
    {
      title: 'Temperature (Celsius)',
    },
    {
      title: 'Percent (%)',
      scale: {
        min: 0,
        max: 100,
      },
    },
  ],
}
```
## 시리즈 theme

LineChart에서 수정할 수 있는 시리즈 테마이다.

```ts
interface LineChartSeriesTheme {
  lineWidth?: number;
  dashSegments?: number[];
  colors?: string[];
  dot?: {
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  select?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  hover?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  dataLabels?: {
    textBubble?: {
      visible?: boolean;
      arrow?: ArrowTheme;
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
    useSeriesColor?: boolean;
    lineWidth?: number;
    textStrokeColor?: string;
    shadowColor?: string;
    shadowBlur?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```

테마는 options의 `theme`값으로 추가 해준다. 간단한 예시로 라인 시리즈의 색상과 두꼐를 바꾸고 싶다면  다음처럼 작성하면 된다.

```js
const options = {
  theme: {
    series: {
      lineWidth: 10,
      colors: [
        '#83b14e',
        '#458a3f',
      ]
    }
  }
};
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/101853581-2c11bc80-3ba3-11eb-91d1-75084cb0d042.png)
