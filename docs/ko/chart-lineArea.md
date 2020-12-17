# Line Area 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Line Area 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스를 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { LineAreaChart } from '@toast-ui/chart';

const chart = new LineAreaChart({el, data, options});

// 혹은 

import Chart from '@toast-ui/chart';

const chart = Chart.lineAreaChart({el, data, options});
```
## 기본 차트

### 데이터 타입

데이터는 `series`와 `categories`값을 입력받는다. 각 차트의 시리즈는 `line`, `area`에 각각 입력되며 `name`과 `data` 쌍으로 입력 받는다. data는 숫자 값만 입력이 가능하다.

```js
const data = {
  categories: [
    '2020.01',
    '2020.02',
    '2020.03',
    '2020.04',
    '2020.05',
    '2020.06',
    '2020.07',
    '2020.08',
    '2020.09',
    '2020.10',
    '2020.11',
    '2014.12',
  ],
  series: {
    area: [
      {
        name: 'Effective Load',
        data: [150, 130, 100, 125, 128, 44, 66, 162, 77, 70, 68, 103],
      },
    ],
    line: [
      {
        name: 'Power Usage',
        data: [72, 80, 110, 117, 129, 137, 134, 66, 121, 88, 114, 117],
      },
    ],
  },
}
```

## 옵션 

`options`는 객체로 작성한다. 각각 차트에 적용하고 싶은 옵션은 `line`, `area`에 작성한다. 사용가능한 옵션은 다음과 같다.

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
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
    zoomable?: boolean;
    showDot?: boolean;
    lineWidth?: number;
    spline?: boolean;
    shift?: boolean;
    line?: {
      selectable?: boolean;
      spline?: boolean;
      showDot?: boolean;
      dataLabels?: {
        visible?: boolean;
        anchor?: DataLabelAnchor;
        offsetX?: number;
        offsetY?: number;
        formatter?: Formatter;
      }
    }
    area?: {
      selectable?: boolean;
      stack?: boolean | {
        type: 'normal' | 'percent';
      };
      spline?: boolean;
      showDot?: boolean;
      dataLabels?: {
        visible?: boolean;
        anchor?: DataLabelAnchor;
        offsetX?: number;
        offsetY?: number;
        formatter?: Formatter;
      }
    }
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
    }
  }
}
```

두 차트 타입에 모두 적용하고 싶은 옵션은 기존 작성하던 방법으로 작성하며 각각의 차트에 구분해 적용하고 싶은 경우 `line`, `area`에 구분해 작성한다.

간단한 예시를 만들어 공통 옵션과 차트 각각의 옵션을 적용해보자.

```js
const options = {
  series: {
    showDot: true,
    line: {
      spline: true
    },
    area: {
      dataLabels: {
        visible: true
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/35371660/102154012-dc413700-3ebb-11eb-83fc-a472c862ec6b.png)

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자. 또한, scatter, line 차트 옵션에 대해 궁금하다면 해당 가이드를 참고하자.
> (링크: 
> [`chart`옵션](./common-chart-options.md),
> [축](./common-axes.md), 
> [범례](./common-legend.md), 
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive`옵션](./common-responsive-options.md), 
> [실시간 업데이트](./common-liveUpdate-options.md),
> [데이터 라벨](./common-dataLabels-options.md),
> [Line 차트](./chart-line.md),
> [Area 차트](./chart-area.md)
> )

## 시리즈 theme

각각의 스타일을 지정할 경우 `series.line` 혹은 `series.area`를 정의한다. 시리즈의 색상을 지정하고 싶은 경우 `colors`를 입력하거나 각각 시리즈를 구분해 색상을 부여하고 싶다면 구분해서 넣어주면 된다. 

```ts
interface LineAreaChartSeriesTheme {
  colors: string[];
  line: {
    // line chart 시리즈 테마
  };
  area: {
    // area chart 시리즈 테마
  };
};
```


간단한 예시로 여러가지 스타일을 각각의 차트에 맞게 작성해보자.

```js
const theme = {
  theme: {
    series: {
      colors: ['#ff3322', '#bbcc22'],
      line: {
        dot: {
          borderColor: '#009dff',
          borderWidth: 2,
          radius: 7,
        },
      },
      area: {
        areaOpacity: 0.5,
      },
    },
  },
};
```

결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102154822-8c636f80-3ebd-11eb-8537-ce44e19c90bb.png)

> [Line 차트](./chart-line.md)와 [Area 차트](./chart-area.md)의 테마는 각각의 가이드를 참고하도록 하자.
