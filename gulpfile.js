'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    sync = require('browser-sync'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    stringify = require('stringify'),
    less = require('gulp-less'),
    minifiyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');

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

gulp.task('compress-js', ['browserify'], function() {
    return gulp.src('dist/application-chart.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('compile-less', function() {
    return gulp.src('src/less/style.less')
        .pipe(less())
        .pipe(rename('application-chart.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify-css', ['compile-less'], function() {
    return gulp.src('dist/application-chart.css')
        .pipe(minifiyCss())
        .pipe(rename({
            extname: '.min.css'
        }))
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

gulp.task('clean-samples', function(callback) {
    del([
        'dist/application-chart.min.js',
        'dist/application-chart.min.css',
        'samples/dist/*',
        'samples/lib/*'
    ], callback);
});

gulp.task('copy-samples', ['clean-samples', 'compress-js', 'minify-css'], function() {
    gulp.src('dist/*.min.*')
        .pipe(gulp.dest('./samples/dist'));
    gulp.src('lib/ne-code-snippet/code-snippet.min.js')
        .pipe(gulp.dest('./samples/lib'));
    return gulp.src('lib/raphael/raphael-min.js')
        .pipe(gulp.dest('./samples/lib'));
});

gulp.task('deploy', ['copy-samples'], function() {
    process.exit(0);
});
