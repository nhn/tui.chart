# ColumnLine 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

ColumnLine 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { ColumnLineChart } from '@toast-ui/chart';

const chart = new ColumnLineChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.columnLineChart({el, data, options});
```
## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 차트의 시리즈는 `column`, `line`에 각각 입력되며 `name`과 `data` 쌍으로 입력 받는다. data는 값을 나타내는 배열로 입력한다.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
      },
      {
        name: 'NewYork',
        data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3],
      },
      {
        name: 'Sydney',
        data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6],
      },
      {
        name: 'Moscow',
        data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2],
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
      },
    ],
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102773432-8f35f700-43cc-11eb-82fe-2eef25c5dada.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
        visible: false,
      },
      {
        name: 'NewYork',
        data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3],
      },
      {
        name: 'Sydney',
        data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6],
      },
      {
        name: 'Moscow',
        data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2],
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
        visible: false,
      },
    ],
  },
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108009092-3fc71c80-7045-11eb-901e-03d20fdee3dc.png)

## colorByCategories 옵션

바 계열 `series`는 `colorByCategories` 옵션을 가질 수 있다. `colorByCategories` 옵션은 차트의 막대 색을 카테고리 별로 다르게 칠할지 결정한다. 기본값은 `false`이다.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
        colorByCategories: true,
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
      },
    ],
  },
}
```
![image](https://user-images.githubusercontent.com/30035674/133181927-0a0b4b85-3ada-4cd5-9727-a4a9ce7d01ed.png)


## 옵션

`options`는 객체로 작성한다. 각각 차트에 적용하고 싶은 옵션은 `column`, `line`에 작성한다. 사용가능한 옵션은 다음과 같다.

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
    column?: {
      selectable?: boolean;
      stack?: boolean | {
        type: 'normal' | 'percent';
        connector?: boolean;
      };
      dataLabels?: {
        visible?: boolean;
        anchor?: 'center' | 'start' | 'end' | 'auto';
        offsetX?: number;
        offsetY?: number;
        formatter?: (value) => string;
        stackTotal?: {
          visible?: boolean;
          formatter?: (value) => string;
        };
      };
    };
    line?: {
      selectable?: boolean;
      spline?: boolena;
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
      stackTotal?: {
        visible?: boolean;
        formatter?: (value) => string;
      };
    }
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자. 또한, column, line 차트 옵션에 대해 궁금하다면 해당 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [실시간 업데이트](./common-liveUpdate-options.md),
> [Column 차트](./chart-column.md),
> [Line 차트](./chart-line.md)
> )

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

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### eventDetectType

툴팁을 나타낼 때 발생하는 마우스 오버와 시리즈를 선택할 때 발생하는 마우스 클릭 시 데이터를 탐지하는 방법을 정의한다.

| 타입 | 설명 |
| --- | --- |
| `grouped` | Y축을 기준으로 값이 같은 모든 데이터가 탐지됨 |
| `point` | 개별 시리즈 영역에 마우스가 다가가야 탐지. 현재 마우스가 가리키고 있는 포인트를 기준으로 단 한 개만 탐지됨 |

* 기본값: `'grouped'`

![image](https://user-images.githubusercontent.com/43128697/102774021-82fe6980-43cd-11eb-8d01-bf1e5dac7a87.png)

`eventDetectType: 'point'`로 설정할 경우 line 시리즈의 점과 column 시리즈의 박스를 각각 마우스 포인터 기준으로 탐지한다.

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)

### column chart options

컬럼 차트와 라인 차트에서 사용할 수 있는 옵션을 각 `series.column`과 `series.line`에 설정한다.

```js
const options = {
  series: {
    column: {
      stack: {
        type: 'normal'
      }
    },
    line: {
      showDot: true,
      spline: true
    }
  }

};
```

![image](https://user-images.githubusercontent.com/43128697/102978791-69356180-4548-11eb-8437-d104e3ed6b66.png)

### dataLabels options

`series.dataLabels` 옵션을 지정하면 Column과 Line 차트에서 모두 데이터 라벨이 표시된다.

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

![image](https://user-images.githubusercontent.com/43128697/103477475-a29c8580-4e02-11eb-9749-a744d5d3fce4.png)

`series` 옵션에 각 시리즈 별로 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 각 시리즈 별로 좀 더 세밀하게 설정해 줄 수 있다.

```ts
type ColumnLineChartSeriesOption = {
  column: { // Column 시리즈 옵션
    ...
    dataLabels: {
      // Column 시리즈 데이터 라벨 옵션
    }
  },
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  }
};
```

아래 코드는 Line 시리즈의 데이터 라벨은 표시해주지 않고, Column 시리즈의 데이터 라벨만 표시하도록 설정한 옵션이다.

```js
const options = {
  series: {
    column: {
      stack: true,
      dataLabels: {
        visible: true,
        stackTotal: {
          visible: false
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477454-6701bb80-4e02-11eb-8256-23421795972e.png)

## 시리즈 theme

각각의 스타일을 지정할 경우 `series.column` 혹은 `series.line`을 정의한다. 시리즈의 색상을 지정하고 싶은 경우 `colors`를 입력하거나 각각 시리즈를 구분해 색상을 부여하고 싶다면 구분해서 넣어주면 된다.

```ts
interface ColumnLineChartSeriesTheme {
  colors: string[];
  column: {
    // column chart 시리즈 테마
  };
  line: {
    // line chart 시리즈 테마
  };
};
```

간단한 예시로 여러가지 스타일을 각각의 차트에 맞게 작성해보자.

```js
const theme = {
  theme: {
    series: {
      colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#bfe000'],
      column: {
        barWidth: 18
      },
      line: {
        dot: {
          radius: 6,
          borderColor: '#ffff00',
          borderWidth: 2
        }
      }
    }
  }
};
```

결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102777876-d6c08100-43d4-11eb-94e5-7b426839aba6.png)


각 시리즈 별로 데이터 라벨의 스타일을 지정할 경우 `series.column.dataLabels` 또는 `series.line.dataLabels`를 정의한다.

```ts
type ColumnLineChartDataLabelTheme = {
  series: {
    column: {
      dataLabels: {
        // Column 시리즈 데이터 라벨 테마
      }
    },
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Column 시리즈 데이터 라벨에는 글자 색상과 크기, 굵기 등을 조절하고, Line 시리즈 데이터 라벨에는 말풍선 스타일을 변경해보았다.

```js
const options = {
  series: {
    column: {
      dataLabels: { visible: true, anchor: 'start' }
    },
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      column: {
        dataLabels: {
          color: '#ffffff',
          fontSize: 10,
          fontWeight: 600
        }
      },
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
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477615-f491db00-4e03-11eb-9207-aa1ee2883aba.png)

> [column 차트](./chart-column.md)와 [line 차트](./chart-line.md)의 테마는 각각의 가이드를 참고한다.
