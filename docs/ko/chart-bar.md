# Bar 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Bar 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스를 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { BarChart } from '@toast-ui/chart';

const chart = new BarChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.barChart({el, data, options});
```

`data`는 카테고리값과 데이터를 넣어주는 방법과 좌푯값을 넣어주는 방법이 있다. 두 가지 방법을 차례대로 살펴보자.

## 기본 차트

### 데이터 타입

`categories` 값은 x축의 틱에 나타나며 `series` 값은 `name`과 `data`가 모두 작성된 데이터가 입력되어야 한다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 id는 유일하게 작성해야 한다.

```js
const data = {
  categories: ['June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000]
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000]
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000]
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000, 3000]
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102580210-84b3fd00-4141-11eb-800e-93c8f296cbb8.png)

## range 차트

### 데이터 타입

기본 차트와 다른 점은 series data의 타입이다. data는 `배열`로 입력되며 값의 시작과 끝을 `숫자값`으로 순서대로 넣어줘야 한다.

```js
const data = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June','July', 'Aug', 'Sep','Oct', 'Nov','Dec'],
  series: [
    {
      name: 'Seoul',
      data: [
        [-8.3, 0.3],
        [-5.8, 3.1],
        [-0.6, 9.1],
        [5.8, 16.9],
        [11.5, 22.6],
        [16.6, 26.6],
        [21.2, 28.8],
        [21.8, 30.0],
        [15.8, 25.6],
        [8.3, 19.6],
        [1.4, 11.1],
        [-5.2, 3.2],
      ],
    },
    {
      name: 'Busan',
      data: [
        [0, 10],
        [3.5, 13.1],
        [5.6, 13.1],
        [10.8, 16.9],
        [11.5, 18.6],
        [13.6, 20.6],
        [15.2, 20.8],
        [21.8, 26.0],
        [17.8, 23.6],
        [11.3, 16.6],
        [4.4, 11.1],
        [3.2, 11.2],
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/43128697/102580628-423ef000-4142-11eb-8fa9-bd88546d40d6.png)

## 그룹형 스택 차트
`stackGroup`을 설정하면 시리즈를 그룹으로 묶어 표현할 수 있다. `series.stack` 옵션을 설정한 경우에만 동작한다.

```js
const data = {
  categories: [
    '0 ~ 9',
    '10 ~ 19',
    '20 ~ 29',
    '30 ~ 39',
    '40 ~ 49',
    '50 ~ 59',
    '60 ~ 69',
    '70 ~ 79',
    '80 ~ 89',
    '90 ~ 99',
    '100 ~',
  ],
  series: [
    {
      name: 'Male - Seoul',
      data: [4007, 5067, 7221, 8358, 8500, 7730, 4962, 2670, 6700, 776, 131],
      stackGroup: 'Male',
    },
    {
      name: 'Female - Seoul',
      data: [3805, 4728, 7244, 8291, 8530, 8126, 5483, 3161, 1274, 2217, 377],
      stackGroup: 'Female',
    },
    {
      name: 'Male - Incheon',
      data: [1392, 1671, 2092, 2339, 2611, 2511, 1277, 6145, 1713, 1974, 194],
      stackGroup: 'Male',
    },
    {
      name: 'Female - Incheon',
      data: [1320, 1558, 1927, 2212, 2556, 2433, 1304, 8076, 3800, 6057, 523],
      stackGroup: 'Female',
    },
  ],
};

const options = {
  series: {
    stack: true
  }
};
```

![group-stack](https://user-images.githubusercontent.com/43128697/102594710-e54f3400-4159-11eb-963b-68e7f4343286.png)

## 옵션

`options`는 객체로 작성한다.

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
    stack?: boolean | {
      type: 'normal' | 'percent';
      connector?: boolean;
    };
    selectable?: boolean;
    eventDetectType?: 'grouped' | 'point';
    diverging?: boolean;
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      stackTotal?: {
        visible?: boolean;
        formatter?: Formatter;
      };
    };
  }
};
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [플롯](./common-plot.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [데이터 라벨](./common-dataLabels-options.md)
> )

### stack

`stack` 옵션을 통해 시리즈들이 쌓인 형태인 스택 차트를 만들 수 있다. 스택 차트는 `'normal'` 타입과 `'percent'` 타입이 존재한다. 필요에 따라 `stack.connector` 옵션을 설정하여 연결선을 표시할 수 있다.

### normal 타입
`series.stack`을 `true`로 설정할 경우 스택 시리즈의 기본 타입은 `'normal'`이다.

```js
const options = {
  series: {
    stack: true
  }
}

// 혹은

const options = {
  series: {
    stack: {
      type: 'normal'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102583546-3f46fe00-4148-11eb-85a9-08231a995b2e.png)

`connector`옵션을 `true`로 설정한 경우 연결선을 표시할 수 있다.

```js
const options = {
  series: {
    stack: {
      type: 'normal',
      connector: true
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102584221-5e925b00-4149-11eb-8bcd-c74aaffcabc1.png)

### percent 타입

`stack.type`을 `'percent'`로 설정한 경우 백분율로 표시한다.

```js
const options = {
  series: {
    stack: {
      type: 'percent'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102583677-73222380-4148-11eb-909d-0b5bafd2e9fb.png)

`connector` 옵션을 `true`로 설정한 경우 연결선을 표시할 수 있다.

```js
const options = {
  series: {
    stack: {
      type: 'percent',
      connector: true
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102584245-6ce07700-4149-11eb-8943-e60a2570891a.png)

### selectable

해당 시리즈를 선택할 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102584453-d52f5880-4149-11eb-859f-b23c538ae771.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### eventDetectType

툴팁을 나타낼 때 발생하는 마우스 오버와 시리즈를 선택할 때 발생하는 마우스 클릭 시 데이터를 탐지하는 방법을 정의할 수 있다.

| 타입 | 설명 |
| --- | --- |
| `point` | 개별 시리즈 영역에 마우스가 다가가야 탐지. 현재 마우스가 가리키고 있는 포인트를 기준으로 단 한 개만 탐지됨 |
| `grouped` | Y축을 기준으로 값이 같은 모든 데이터가 탐지됨 |

* 기본값: `point`

![eventDetectType.point](https://user-images.githubusercontent.com/43128697/102585157-3572ca00-414b-11eb-9288-5db8fabb7092.png)

`eventDetectType`을 `'grouped'`로 설정할 경우 Y축을 기준으로 값이 같은 데이터가 모두 탐지된다.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/102585109-1a07bf00-414b-11eb-8a76-0e96cd61b291.png)

### diverging

`diverging` 옵션을 사용하면 인구 분포 차트와 같이 양쪽으로 나누어진 분기 차트를 만들 수 있다.
분기 차트는 `data.series`의 첫 번째 및 두 번째 요소를 사용한다.

* 기본값: `false`

```js
const data = {
    categories: [
    '100 ~',
    '90 ~ 99',
    '80 ~ 89',
    '70 ~ 79',
    '60 ~ 69',
    '50 ~ 59',
    '40 ~ 49',
    '30 ~ 39',
    '20 ~ 29',
    '10 ~ 19',
    '0 ~ 9',
  ],
  series: [
    {
      name: 'Male',
      data: [383, 3869, 39590, 136673, 248265, 419886, 451052, 391113, 352632, 296612, 236243],
    },
    {
      name: 'Female',
      data: [1255, 12846, 83976, 180790, 263033, 412847, 435981, 374321, 317092, 272438, 223251],
    },
  ],
};

const options = {
  series: {
    diverging: true
  }
};
```
![diverging](https://user-images.githubusercontent.com/43128697/102586431-7e2b8280-414d-11eb-8ca6-1328d149566d.png)

`yAxis.align`을 `"center"`옵션을 지정해주면 Y축이 중앙에 위치하는 분기 차트를 만들 수 있다.

```js
const options = {
  yAxis: {
    align: 'center'
  },
  series: {
    diverging: true
  }
};
```

![diverging-center-y-axis](https://user-images.githubusercontent.com/43128697/102586557-b632c580-414d-11eb-98bf-fb54e7792c8d.png)

## 시리즈 theme

Bar 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface BoxChartSeriesTheme {
  barWidth?: number | string;
  areaOpacity?: number;
  colors?: string[];
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    groupedRect?: {
      color?: string;
      opacity?: number;
    };
  };
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    areaOpacity?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    groupedRect?: {
      color?: string;
      opacity?: number;
    };
    restSeries?: {
      areaOpacity?: number;
    };
  };
  connector?: {
    color?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
  dataLabels?: DefaultDataLabelsTheme & {
     stackTotal?: DefaultDataLabelsTheme;
  };
}

type DefaultDataLabelsTheme = {
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
  };
  useSeriesColor?: boolean;
  lineWidth?: number;
  textStrokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| barWidth | number | 시리즈 라인 두께 |
| areaOpacity | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| colors | string[] | 시리즈의 색상 |
| hover | object | 데이터에 마우스를 올렸을 때 스타일 |
| hover.groupRect | object | 옵션 `series.eventDetectType: "grouped"`로 설정되어 있을 때, Y축 기준으로 오버되는 영역의 스타일 |
| select | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| select.areaOpacity | number | 선택된 시리즈의 영역 투명도 |
| select.groupRect | object | 옵션 `series.eventDetectType: "grouped"`로 설정되어 있을 때, Y축 기준으로 선택되는 영역의 스타일 |
| select.restSeries | object | 선택되지 않은 시리즈의 스타일 |
| dataLabels | object | 데이터 라벨 스타일. 구체적인 정보는 DataLabels 가이드를 참고한다. |

테마는 options의 `theme` 값으로 추가해 준다. 간단한 예시로 바 시리즈의 색상과 두께를 바꾸고, 마우스 올렸을 때 스타일을 변경하고 싶다면 다음처럼 작성하면 된다.

```js
const options = {
  theme: {
    series: {
      barWidth: 5,
      colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
      hover: {
        color: '#00ff00',
        borderColor: '#73C8E7',
        borderWidth: 3,
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 6,
      },
    }
  }
};
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102593558-5f7eb900-4158-11eb-9d21-1bfa55dfa3f1.png)
