"use strict";
exports.__esModule = true;
exports.responderDetectors = {
    circle: function (mousePosition, model, componentRect) {
        var x = model.x, y = model.y, radius = model.radius;
        var radiusAdjustment = 10;
        return (Math.pow(mousePosition.x - (x + componentRect.x), 2) +
            Math.pow(mousePosition.y - (y + componentRect.y), 2) <
            Math.pow(radius + radiusAdjustment, 2));
    },
    rect: function (mousePosition, model) {
        var x = model.x, y = model.y, width = model.width, height = model.height;
        return (mousePosition.x >= x &&
            mousePosition.x <= x + width &&
            mousePosition.y >= y &&
            mousePosition.y <= y + height);
    }
};
