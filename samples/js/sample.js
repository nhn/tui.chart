'use strict';

(function(root) {
    var onClick = function() {
        var chart = root.ne.application.chart,
            container = document.getElementById('chart-area'),
            type = document.getElementById('type').value,
            elData = document.getElementById('data'),
            elOptions = document.getElementById('options'),
            elTheme = document.getElementById('theme'),
            data = elData ? JSON.parse(elData.value) : {},
            options = elOptions ? JSON.parse(elOptions.value) : null,
            theme = elOptions ? JSON.parse(elTheme.value) : null;

        if (options && options.theme && theme) {
            chart.registerTheme(options.theme, theme);
        }

        container.innerHTML = '';
        chart[type](container, data, options);
    };

    var openWindow = function(url) {
        window.open(url, '_blank');
    };

    root.onClick = onClick;
    root.openWindow = openWindow;
})(window);
