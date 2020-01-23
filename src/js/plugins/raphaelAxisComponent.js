/**
 * @fileoverview Raphael title renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import raphaelRenderUtil from './raphaelRenderUtil';
import chartConst from '../const';
const { Y_AXIS_TITLE_PADDING, AXIS_BACKGROUND_RIGHT_PADDING } = chartConst;

class RaphaelAxisComponent {
  constructor() {
    this.ticks = [];
  }

  /**
   * Render background with plot background color
   * @param {object} paper Raphael paper
   * @param {object} position axis position
   * @param {object} dimension axis dimension
   * @param {object} theme chart theme
   * @returns {Element} - raphael <rect> element
   * @private
   */
  renderBackground(paper, position, dimension, theme) {
    const background = (theme && theme.background) || {};
    const { color = '#fff', opacity = 1 } = background;

    return raphaelRenderUtil.renderRect(
      paper,
      {
        left: 0,
        top: position.top,
        width: dimension.width + position.left - AXIS_BACKGROUND_RIGHT_PADDING,
        height: dimension.height
      },
      {
        fill: color,
        opacity,
        'stroke-width': 0
      }
    );
  }

  /**
   * Render title
   * @param {object} paper raphael paper
   * @param {object} data rendering data
   * @param {string} data.text text content
   * @param {object} data.theme theme object
   * @param {object} data.rotationInfo object
   * @param {object} data.layout dimension and position
   */
  renderTitle(paper, data) {
    const { theme, rotationInfo } = data;
    const { fontFamily, fontSize, fontWeight, color } = theme;
    const textAnchor = this.getRenderTitleAnchor(rotationInfo);
    const attributes = {
      'dominant-baseline': 'auto',
      'font-family': fontFamily,
      'font-size': fontSize,
      'font-weight': fontWeight,
      fill: color,
      transform: 'none',
      'text-anchor': textAnchor
    };
    const position = this.calculatePosition(paper, data);
    const title = raphaelRenderUtil.renderText(paper, position, data.text, attributes);

    title.node.style.userSelect = 'none';
    title.node.style.cursor = 'default';

    data.set.push(title);
  }

  /**
   * Get title anchor
   * @param {object} rotationInfo - isCenter, isVertical, isPositionRight
   * @returns {string} textAnchor - middle or end or start
   */
  getRenderTitleAnchor(rotationInfo) {
    let textAnchor = 'middle';
    if (
      rotationInfo.isPositionRight ||
      (!rotationInfo.isVertical && !rotationInfo.isXAxisTitleLeft)
    ) {
      textAnchor = 'end';
    } else if (
      (rotationInfo.isVertical && !rotationInfo.isCenter) ||
      (!rotationInfo.isVertical && rotationInfo.isXAxisTitleLeft)
    ) {
      textAnchor = 'start';
    }

    return textAnchor;
  }

  /**
   * Render Axis label
   * @param {object} data data for render label
   *       @param {{
   *           left: number,
   *           top: number
   *       }} data.positionTopAndLeft left, top positions
   *       @param {string} data.labelText label text
   *       @param {number} data.labelSize label size
   *       @param {object} data.paper raphael paper
   *       @param {boolean} data.isVertical boolean value of axis is vertical
   *       @param {boolean} data.isPositionRight boolean value of axis is right yAxis
   *       @param {object} data.theme theme of label
   */
  renderLabel(data) {
    const { positionTopAndLeft, labelText, paper, theme, isVertical, isCenter } = data;
    const attributes = {
      'dominant-baseline': 'central',
      'font-family': theme.fontFamily,
      'font-size': theme.fontSize,
      'font-weight': theme.fontWeight,
      fill: theme.color
    };

    if (data.isPositionRight) {
      attributes['text-anchor'] = 'end';
    } else if (isVertical && !isCenter) {
      attributes['text-anchor'] = 'start';
    } else {
      attributes['text-anchor'] = 'middle';
    }

    const textObj = raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, attributes);

    textObj.node.style.userSelect = 'none';
    textObj.node.style.cursor = 'default';

    data.set.push(textObj);
    this.ticks.push(textObj);
  }

  /**
   * Render rotated Axis label
   * @param {object} data data for render rotated label
   *       @param {{
   *           left: number,
   *           top: number
   *       }} data.positionTopAndLeft left, top positions
   *       @param {string} data.labelText label text
   *       @param {object} data.paper raphael paper
   *       @param {boolean} data.isVertical boolean value of axis is vertical
   *       @param {object} data.theme theme of label
   *       @param {number} data.degree rotation degree
   */
  renderRotatedLabel(data) {
    const { positionTopAndLeft, labelText, paper, theme } = data;
    const textObj = raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, {
      'dominant-baseline': 'central',
      'font-family': theme.fontFamily,
      'font-size': theme.fontSize,
      'font-weight': theme.fontWeight,
      fill: theme.color,
      'text-anchor': 'end',
      transform: `r${-data.degree},${positionTopAndLeft.left},${positionTopAndLeft.top}`
    });

    textObj.node.style.userSelect = 'none';
    textObj.node.style.cursor = 'arrow';

    data.set.push(textObj);
    this.ticks.push(textObj);
  }

  /**
   * Render ticks on given paper
   * @param {object} data data for rendering ticks
   */
  renderTicks(data) {
    const {
      paper,
      positions,
      additionalSize,
      isVertical,
      isCenter,
      isDivided,
      isPositionRight,
      tickColor,
      layout
    } = data;

    const rightEdgeOfAxis = layout.position.left + layout.dimension.width;
    const baseTop = layout.position.top;
    const baseLeft = layout.position.left;
    const centerAxisWidth = isDivided ? data.otherSideDimension.width : 0;
    const isContainDivensionArea = position => {
      const compareType = isVertical ? 'height' : 'width';

      return position > layout.dimension[compareType] + centerAxisWidth;
    };
    let tick;

    positions.forEach(position => {
      let pathString = 'M';

      position += additionalSize;

      if (isContainDivensionArea(position)) {
        return;
      }

      if (isVertical) {
        if (isCenter) {
          pathString += `${baseLeft},${baseTop + position}`;
          pathString += `H${baseLeft + 5}`;

          pathString += `M${rightEdgeOfAxis},${baseTop + position}`;
          pathString += `H${rightEdgeOfAxis - 5}`;
        } else if (isPositionRight) {
          pathString += `${baseLeft},${baseTop + position}`;
          pathString += `H${baseLeft + 5}`;
        } else {
          pathString += `${rightEdgeOfAxis},${baseTop + position}`;
          pathString += `H${rightEdgeOfAxis - 5}`;
        }
      } else {
        pathString += `${baseLeft + position},${baseTop}`;
        pathString += `V${baseTop + 5}`;
      }

      if (!isNaN(position)) {
        tick = paper.path(pathString).attr({
          stroke: tickColor,
          opacity: 0.5
        });
        data.set.push(tick);
        this.ticks.push(tick);
      }
    });
  }

  /**
   * Render tick line  on given paper
   * @param {number} data data for render tick line
   * @param {number} data.areaSize area size width or height
   * @param {object} data.paper raphael paper
   * @param {boolean} data.isVertical boolean value of vertical axis or not
   */
  renderStandardLine(data) {
    const {
      areaSize: lineSize,
      layout: { position, dimension },
      paper,
      isVertical
    } = data;
    const baseLeft = position.left;
    const minAbs = Math.abs(data.axisLimit.min);
    const maxAbs = Math.abs(data.axisLimit.max);
    const standardRatio = 1 - maxAbs / (minAbs + maxAbs);
    let pathString = 'M';
    let baseTop = position.top;
    let rightEdgeOfAxis = baseLeft + dimension.width;

    if (isVertical) {
      const lineStartYCoord = baseTop;
      rightEdgeOfAxis += data.seriesDimension.width * standardRatio;
      pathString += `${rightEdgeOfAxis},${lineStartYCoord}`;
      const lineEndYCoord = baseTop + lineSize;
      pathString += `V${lineEndYCoord}`;
    } else {
      pathString += baseLeft;
      baseTop -= data.seriesDimension.height * standardRatio;
      pathString += `,${baseTop}H`;
      const lineEndXCoord = baseLeft + lineSize;
      pathString += lineEndXCoord;
    }

    data.set.push(
      paper.path(pathString).attr({
        'stroke-width': 1,
        opacity: 0.5
      })
    );
  }

  /**
   * Render tick line  on given paper
   * @param {number} data data for render tick line
   * @param {number} data.areaSize area size width or height
   * @param {object} data.paper raphael paper
   * @param {boolean} data.isNotDividedXAxis boolean value for XAxis divided or not
   * @param {number} data.additionalSize additional size for position and line length
   * @param {number} data.additionalWidth additional width of tick line paper
   * @param {number} data.additionalHeight additional height of tick line paper
   * @param {boolean} data.isPositionRight boolean value of right yAxis or not
   * @param {boolean} data.isCenter boolean value of center yAxis or not
   * @param {boolean} data.isVertical boolean value of vertical axis or not
   */
  renderTickLine(data) {
    const {
      areaSize,
      paper,
      layout: {
        position: { top: baseTop, left: baseLeft },
        dimension
      },
      isNegativeStandard,
      isNotDividedXAxis,
      additionalSize,
      isPositionRight,
      isCenter,
      isVertical,
      tickColor,
      seriesDimension
    } = data;
    const lineSize = areaSize;
    const verticalTickLineEndYCoord = dimension.height + baseTop;
    let rightEdgeOfAxis = baseLeft + dimension.width;
    let pathString = 'M';
    let lineStartYCoord, lineEndYCoord;

    if (isPositionRight) {
      pathString += `${baseLeft},${baseTop}`;
      pathString += `V${verticalTickLineEndYCoord}`;
    } else if (isVertical) {
      lineStartYCoord = baseTop;
      if (isNegativeStandard) {
        rightEdgeOfAxis += seriesDimension.width / 2;
      }
      pathString += `${rightEdgeOfAxis},${lineStartYCoord}`;

      if (isCenter) {
        pathString += `V${verticalTickLineEndYCoord}`;
        pathString += `M${baseLeft},${lineStartYCoord}`;
        pathString += `V${verticalTickLineEndYCoord}`;
      } else {
        lineEndYCoord = baseTop + lineSize;
        pathString += `V${lineEndYCoord}`;
      }
    } else {
      pathString = this._makeNormalTickPath(pathString, {
        isNotDividedXAxis,
        baseTop,
        baseLeft,
        additionalSize,
        isNegativeStandard,
        seriesDimension,
        lineSize
      });
    }

    data.set.push(
      paper.path(pathString).attr({
        'stroke-width': 1,
        stroke: tickColor,
        opacity: 0.5
      })
    );
  }

  /**
   * Render tick line  on given paper
   * @param {string} pathString render path string
   * @param {object} pathInfo render path infos
   *   @param {boolean} pathInfo.isNotDividedXAxis boolean value for XAxis divided or not
   *   @param {number} pathInfo.baseTop baseTop
   *   @param {number} pathInfo.baseLeft baseLeft
   *   @param {number} pathInfo.additionalSize additional size for position and line length
   *   @param {boolean} bpathInfo.isNegativeStandard boolean value for XAxis divided or not
   *   @param {object} pathInfo.seriesDimension seriesDemension
   *   @param {number} pathInfo.lineSize tick line size
   *   @returns {string} pathString
   * @private
   */
  _makeNormalTickPath(pathString, pathInfo) {
    if (pathInfo.isNotDividedXAxis) {
      pathString += pathInfo.baseLeft;
    } else {
      pathString += pathInfo.baseLeft + pathInfo.additionalSize;
    }

    if (pathInfo.isNegativeStandard) {
      pathInfo.baseTop -= pathInfo.seriesDimension.height / 2;
    }

    pathString += `,${pathInfo.baseTop}H`;

    let lineEndXCoord = pathInfo.baseLeft + pathInfo.lineSize;

    if (!pathInfo.isNotDividedXAxis) {
      lineEndXCoord += pathInfo.additionalSize;
    }

    pathString += lineEndXCoord;

    return pathString;
  }

  /**
   * Animate ticks for adding data
   * @param {number} tickSize tick size of moving
   */
  animateForAddingData(tickSize) {
    this.ticks.forEach(tick => {
      tick.animate(
        {
          transform: `t-${tickSize},0`
        },
        300
      );
    });
  }

  /**
   * Calculate axis title position, and transform
   * @param {Raphael.paper} paper - paper
   * @param {object} data - options for calculating title position
   *  @param {object} data.rotationInfo - isCenter, isVertical, isPositionRight
   *  @param {object} data.text - text
   *  @param {object} data.theme - theme
   *  @param {object} data.layout - layout
   * @returns {object} position - top, left
   */
  calculatePosition(paper, data) {
    const {
      rotationInfo,
      text,
      theme,
      additionalWidth,
      otherSideDimension,
      areaSize,
      layout
    } = data;
    const textHeight = getTextHeight(text, theme);
    const textWidth = getTextWidth(text, theme);
    const axisHeight = layout.dimension.height;
    const axisWidth = layout.dimension.width;
    const { top, left } = layout.position;
    const leftPosition = left + additionalWidth;
    const adjustLeftPosition = textWidth - otherSideDimension.width;
    const position = {
      top: top + axisHeight - textHeight / 2,
      left: leftPosition + (adjustLeftPosition < 0 ? 0 : adjustLeftPosition)
    };

    if (rotationInfo.isVertical) {
      if (rotationInfo.isCenter) {
        position.top += textHeight / 2;
        position.left = left + axisWidth / 2;
      } else if (!rotationInfo.isDiverging) {
        position.top = top - textHeight / 2 - Y_AXIS_TITLE_PADDING;
      }
    } else if (!rotationInfo.isVertical) {
      if (rotationInfo.isDiverging && rotationInfo.isYAxisCenter) {
        position.left = left + areaSize / 2;
      } else if (rotationInfo.isDiverging && !rotationInfo.isYAxisCenter) {
        position.left = left + axisWidth / 2;
      } else if (rotationInfo.isXAxisTitleLeft) {
        position.left = layout.position.left;
      } else {
        position.left = layout.position.left + axisWidth;
      }
    }

    if (rotationInfo.isPositionRight) {
      position.left += axisWidth;
    }

    if (!rotationInfo.isCenter) {
      addOffset(position, data.offset);
    }

    return position;
  }
}

/**
 * Get a text height by theme
 * @param {string} text - text
 * @param {object} theme - axis theme
 * @returns {number} text height
 * @ignore
 */
function getTextHeight(text, theme) {
  const titleSize = raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily);

  return titleSize.height;
}

/**
 * Get a text width by theme
 * @param {string} text - text
 * @param {object} theme - axis theme
 * @returns {number} text width
 * @ignore
 */
function getTextWidth(text, theme) {
  const titleSize = raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily);

  return titleSize.width;
}

/**
 * Add offset to position
 * @param {object} position - top, left
 * @param {object} offset - x, y
 * @ignore
 */
function addOffset(position, offset) {
  if (!offset) {
    return;
  }

  if (offset.x) {
    position.left += offset.x;
  }
  if (offset.y) {
    position.top += offset.y;
  }
}

export default RaphaelAxisComponent;
