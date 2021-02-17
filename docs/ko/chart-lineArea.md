# LineArea 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

LineArea 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스를 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

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
    '2020.12',
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

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

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
    '2020.12',
  ],
  series: {
    area: [
      {
        name: 'Effective Load',
        data: [150, 130, 100, 125, 128, 44, 66, 162, 77, 70, 68, 103],
        visible: false,
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

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108010476-4c00a900-7048-11eb-8c34-529c865a75aa.png)

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
        formatter?: (value) => string;
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
        formatter?: (value) => string;
      }
    }
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
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
> [Line 차트](./chart-line.md),
> [Area 차트](./chart-area.md)
> )

### dataLabels

`series.dataLabels` 옵션을 지정하면 Line과 Area 차트에서 모두 데이터 라벨이 표시된다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478314-248fad00-4e09-11eb-8bca-ecd98a4f2776.png)

`series` 옵션에 각 시리즈 별로 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 각 시리즈 별로 좀 더 세밀하게 설정해 줄 수 있다.

```ts
type LineAreaChartSeriesOption = {
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  },
  area: { // Area 시리즈 옵션
    ...
    dataLabels: {
      // Area 시리즈 데이터 라벨 옵션
    }
  }
};
```

아래 코드는 Area 시리즈의 데이터 라벨은 표시해주지 않고, Line 시리즈의 데이터 라벨만 표시하도록 설정한 옵션이다.

```js
const options = {
  series: {
    line: {
      dataLabels: {
        visible: true
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478360-7c2e1880-4e09-11eb-8319-b56af88d7f07.png)

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

각 시리즈 별로 데이터 라벨의 스타일을 지정할 경우 `series.line.dataLabels` 또는 `series.area.dataLabels`를 정의한다.

```ts
type LineAreaChartDataLabelTheme = {
  series: {
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    },
    area: {
      dataLabels: {
        // Area 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Area 시리즈와 Line 시리즈의 데이터 라벨 스타일을 글자 색상과 크기, 굵기 등을 조절하고 말풍선 스타일로 변경해보았다.

```js
const options = {
  series: {
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: 15 }
    },
    area: {
      dataLabels: { visible: true, offsetY: -15 }
    },
  },
  theme: {
    series: {
      line: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'top',
            },
          },
        },
      },
      area: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478270-acc18280-4e08-11eb-9558-c85c72e2359d.png)

> [Line 차트](./chart-line.md)와 [Area 차트](./chart-area.md)의 테마는 각각의 가이드를 참고하도록 하자.
