var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    sync = require('browser-sync'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    stringify = require('stringify'),
    less = require('gulp-less');

gulp.task('browser-sync', function() {
    sync({
        server: {
            baseDir: '.'
        },
        port: process.env.PORT || 8080
    });
});

gulp.task('browserify', function() {
    var b = watchify(browserify('./src/js/chart.js', {debug: true})),
        rebundle;
    gutil.log(gutil.colors.green('rebundle...'));
    rebundle = function() {
        return b.bundle()
            .pipe(source('./application-chart.js'))
            .pipe(gulp.dest('./dist'));
    };

    b.add('./src/js/plugins/pluginRaphael.js');
    b.transform(stringify(['.html']));

    return rebundle();
});

gulp.task('compile-less', function() {
    return gulp.src('src/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./dist'));

});

gulp.task('reload-js', ['browserify'], function() {
    sync.reload();
});

gulp.task('reload-less', ['compile-less'], function() {
    sync.reload();
});

gulp.task('watch', ['browserify', 'compile-less', 'browser-sync'], function() {
    gulp.watch('src/js/**/*', ['reload-js']);
    gulp.watch('src/less/**/*', ['reload-less']);

    gutil.log(gutil.colors.green('Watching for changes...'));
});

gulp.task('default', ['watch']);