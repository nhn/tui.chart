# component-chart

## Spec

* native javascript 지양
* 확장 가능하도록 개발
* IE8 이상 지원
* 애니메이션
  * 최신브라우저 : 적당한 애니메이션 필요
  * 구형브라우저(IE8) : 최소화
* 글로벌화 고려
* 오픈소스 고려
* 지원 차트
  * 기본 차트
    * bar
    * line
    * pie
  * 추가 차트

## Concept

* 익숙한 사용방법 제공
  * 기존 ne component와 사용방법 유사
```html
  <script type="text/javascript" src="./js/raphael-min.js"></script>
  <script type="text/javascript" src="./js/component-chart.js"></script>
  <script>
    var chart = ne.chart(container, {
        chartType : 'Raphael', //default
        type : 'BAR',
        data : [...],
        styles: {}
    });
    chart.render();
  </script>
```
* 입력 data가 간단하다.
  * google방식의 data입력 차용
    * https://developers.google.com/chart/interactive/docs/reference#arraytodatatable
    * https://developers.google.com/chart/interactive/docs/gallery/barchart
    * https://developers.google.com/chart/interactive/docs/datatables_dataviews#arraytodatatable
```javascript
  ...
  chart.setData([
     ['Element', 'Density', { role: 'style' }],
     ['Copper', 8.94, '#b87333'],
     ['Silver', 10.49, 'silver'],
     ['Gold', 19.30, 'gold'],
     ['Platinum', 21.45, 'color: #e5e4e2' ]
  ]);
```
* 디자인 적용이 쉽고 유연하다.
  * Color, Font, Grid line, Number format, Background Color
```javascript
  ...
  chart.setStyles({
    font:'애플고딕',
    gridLine: '1px solid #000',
    numberFormat: true,
    gridGackground: 'gray'
  });
  
  chart.setData([
     ['Element', 'Density', { role: 'style' }],
     ['Copper', 8.94, '#b87333'], // Series의 색상 표현
     ...
  ]);
  ...
```

* 도형은 외부라리브러리를 사용하고 그 외 부분은 직접 개발 (기존 프로젝트 동일)
* 도형 라이브러리 교체가 쉽다.
  * 추후 D3라이브러리로 교체하거나 자체 개발 플러그인으로 변경 용이
```html
  <script type="text/javascript" src="./js/d3-min.js"></script>
  <script type="text/javascript" src="./js/component-chart.js"></script>
  <script type="text/javascript" src="./js/ne-chart-plugin-d3.js"></script>
  <script>
    ...
    chart.changeChart('D3');
    ...
  </script>
```

## Plan

* 2015.06.17 ~ 2015.06.26 : 기존 프로젝트 분석 및 차트 스터디
  * https://github.nhnent.com/fe/Application-Chart
  * http://wiki.nhnent.com/display/org/Chart
  * https://msdn.microsoft.com/en-us/library/vstudio/dd456696(v=vs.100).aspx
  * https://developers.google.com/chart/interactive/docs/
* 2015.06.29 ~ 2015.07.03 : 설계 및 base 코딩
* 2015.07.06 ~ 2015.07.17 : raphealjs를 이용하여 bar chart 구현
  * 플러그인 구성 방법 결정
* 2015.07.20 ~ 2015.07.31 : line, pie chart 구현 (기본 차트 1차 완료)

