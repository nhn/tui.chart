# 레이아웃 설정

## 플롯
기본적으로 모든 차트에서 사용하는 `plot` 옵션으로 `width`, `height`을 제공하다. `width`, `height`값을 지정하면 실제 차트 시리즈가 그려지는 영역의 크기를 설정할 수 있다.

```ts
type PlotOption = {
  width?: number;
  height?: number;
  ...
};
```

``js
const options = {
  plot: {
    width: 800,
    height: 400
  }
};
```
