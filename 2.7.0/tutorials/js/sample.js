'use strict';

(function(root) {
    var container = document.getElementById('chart-area'),
        type = document.getElementById('type').value,
        elData = document.getElementById('data'),
        elOptions = document.getElementById('options'),
        elThemeArea = document.getElementById('theme-area'),
        elUseTheme = document.getElementById('use-theme'),
        elTheme = document.getElementById('theme');
    var onBtnClick = function() {
        var chart = root.tui.chart,
            data = elData ? JSON.parse(elData.value) : {},
            options = elOptions ? eval('(' + elOptions.value + ')') : null,
            theme = elTheme && elOptions ? JSON.parse(elTheme.value) : null;

        if (options && options.theme && theme) {
            chart.registerTheme(options.theme, theme);
        }

        if (elUseTheme && !elUseTheme.checked) {
            delete options.theme;
        }

        container.innerHTML = '';
        root.chart = chart[type](container, data, options);
    };

    var onCheckboxClick = function(elTarget) {
        var objOptions = eval('(' + elOptions.value + ')');
        if (elTarget.checked) {
            elThemeArea.className = 'show';
            objOptions.theme = 'newTheme';
        } else {
            elThemeArea.className = '';
            delete objOptions.theme;
        }
        elOptions.value = JSON.stringify(objOptions, null, 4);
    };

    var openWindow = function(url) {
        window.open(url, '_blank');
    };

    root.onBtnClick = onBtnClick;
    root.openWindow = openWindow;
    root.onCheckboxClick = onCheckboxClick;
})(window);
