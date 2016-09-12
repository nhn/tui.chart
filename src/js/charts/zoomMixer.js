/**
 * @fileoverview zoomMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * zoomMixer is mixer of line type chart(line, area).
 * @mixin
 */
var zoomMixer = {
    /**
     * Render for zoom.
     * @param {boolean} isResetZoom - whether reset zoom or not
     * @private
     */
    _renderForZoom: function(isResetZoom) {
        var self = this;

        this._render(function(renderingData) {
            renderingData.customEvent.isResetZoom = isResetZoom;
            self._renderComponents(renderingData, 'zoom');
        });
    },

    /**
     * On zoom.
     * @param {Array.<number>} indexRange - index range for zoom
     * @override
     */
    onZoom: function(indexRange) {
        this._pauseAnimationForAddingData();
        this.dataProcessor.updateRawDataForZoom(indexRange);
        this._renderForZoom(false);
    },

    /**
     * On reset zoom.
     * @override
     */
    onResetZoom: function() {
        var rawData = this.dataProcessor.getOriginalRawData();

        if (this.checkedLegends) {
            rawData = this._filterCheckedRawData(rawData, this.checkedLegends);
        }

        this.scaleModel.initForAutoTickInterval();

        this.dataProcessor.initData(rawData);
        this.dataProcessor.initZoomedRawData();
        this.dataProcessor.addDataFromRemainDynamicData(tui.util.pick(this.options.series, 'shifting'));
        this._renderForZoom(true);
        this._restartAnimationForAddingData();
    }
};

module.exports = zoomMixer;
