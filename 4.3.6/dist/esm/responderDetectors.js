import { isUndefined } from "./helpers/utils";
import { calculateRadianToDegree, withinRadian } from "./helpers/sector";
function withinRotationRect({ slope, yIntercept, mouseX, mouseY, modelXPositions, compX, compY, detectionSize = 0, }) {
    const [x1, x2] = modelXPositions;
    const posY = slope * (mouseX - compX) + yIntercept;
    const withinRadius = (x1 > x2 && mouseX >= compX + x2 && mouseX <= compX + x1) ||
        (x1 < x2 && mouseX <= compX + x2 && mouseX >= compX + x1);
    const withinDetectionSize = posY - detectionSize + compY <= mouseY && mouseY <= posY + detectionSize + compY;
    return withinRadius && withinDetectionSize;
}
export const responderDetectors = {
    circle: (mousePosition, model, componentRect) => {
        const { x, y } = mousePosition;
        const { x: modelX, y: modelY, radius, detectionSize } = model;
        const { x: compX, y: compY } = componentRect;
        const radiusAdjustment = isUndefined(detectionSize) ? 10 : detectionSize;
        return (Math.pow((x - (modelX + compX)), 2) + Math.pow((y - (modelY + compY)), 2) < Math.pow((radius + radiusAdjustment), 2));
    },
    rect: (mousePosition, model, componentRect = { x: 0, y: 0, width: 0, height: 0 }) => {
        const { x, y } = mousePosition;
        const { x: modelX, y: modelY, width, height } = model;
        const { x: compX, y: compY } = componentRect;
        return (x >= modelX + compX &&
            x <= modelX + compX + width &&
            y >= modelY + compY &&
            y <= modelY + compY + height);
    },
    sector: (mousePosition, model, componentRect = { x: 0, y: 0, width: 0, height: 0 }) => {
        const { x, y } = mousePosition;
        const { x: modelX, y: modelY, radius: { outer, inner }, degree: { start, end }, drawingStartAngle, clockwise, } = model;
        const { x: compX, y: compY } = componentRect;
        const xPos = x - (modelX + compX);
        const yPos = y - (modelY + compY);
        const insideOuterRadius = Math.pow(xPos, 2) + Math.pow(yPos, 2) < Math.pow(outer, 2);
        const outsideInnerRadius = Math.pow(xPos, 2) + Math.pow(yPos, 2) > Math.pow(inner, 2);
        const withinRadius = insideOuterRadius && outsideInnerRadius;
        const detectionDegree = calculateRadianToDegree(Math.atan2(yPos, xPos), drawingStartAngle);
        return withinRadius && withinRadian(clockwise, start, end, detectionDegree);
    },
    line: (mousePosition, model, componentRect = { x: 0, y: 0, width: 0, height: 0 }) => {
        const { x, y } = mousePosition;
        const { x: compX, y: compY } = componentRect;
        const { x: modelX, y: modelY, x2, y2, detectionSize = 3 } = model;
        const numerator = y2 - modelY;
        const denominator = x2 - modelX;
        let withinLine = false;
        if (numerator === 0) {
            const minX = Math.min(modelX, x2);
            const maxX = Math.max(modelX, x2);
            withinLine =
                x - compX >= minX &&
                    x - compX <= maxX &&
                    y >= modelY + compY - detectionSize &&
                    y <= modelY + compY + detectionSize;
        }
        else if (denominator === 0) {
            const minY = Math.min(modelY, y2);
            const maxY = Math.max(modelY, y2);
            withinLine =
                y - compY >= minY &&
                    y - compY <= maxY &&
                    x >= modelX + compX - detectionSize &&
                    x <= modelX + compX + detectionSize;
        }
        else {
            const slope = numerator / denominator;
            const xPos = x - (modelX + compX);
            const yPos = y - (modelY + compY);
            withinLine = slope * xPos === yPos;
        }
        return withinLine;
    },
    boxPlot: (mousePosition, model, componentRect = { x: 0, y: 0, width: 0, height: 0 }) => {
        return ['rect', 'median', 'minimum', 'maximum', 'upperWhisker', 'lowerWhisker'].some((prop) => {
            if (!model[prop]) {
                return false;
            }
            return prop === 'rect'
                ? responderDetectors.rect(mousePosition, model[prop], componentRect)
                : responderDetectors.line(mousePosition, model[prop], componentRect);
        });
    },
    clockHand: (mousePosition, model, componentRect = { x: 0, y: 0, width: 0, height: 0 }) => {
        const { x, y } = mousePosition;
        const { x: compX, y: compY } = componentRect;
        const { x: centerX, y: centerY, x2, y2, detectionSize = 5 } = model;
        const numerator = y2 - centerY;
        const denominator = x2 - centerX;
        let withinClockHand = false;
        if (numerator === 0) {
            const minX = Math.min(centerX, x2);
            const maxX = Math.max(centerX, x2);
            withinClockHand =
                x - compX >= minX &&
                    x - compX <= maxX &&
                    y >= centerY + compY - detectionSize &&
                    y <= centerY + compY + detectionSize;
        }
        else if (denominator === 0) {
            const minY = Math.min(centerY, y2);
            const maxY = Math.max(centerY, y2);
            withinClockHand =
                y - compY >= minY &&
                    y - compY <= maxY &&
                    x >= centerX + compX - detectionSize &&
                    x <= centerX + compX + detectionSize;
        }
        else {
            const slope = numerator / denominator;
            const yIntercept = centerY - slope * centerX;
            withinClockHand = withinRotationRect({
                slope,
                yIntercept,
                mouseX: x,
                mouseY: y,
                modelXPositions: [centerX, x2],
                compX,
                compY,
                detectionSize,
            });
        }
        return withinClockHand;
    },
};
