'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var stringify = require('stringify');
var less = require('gulp-less');
var minifiyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var header = require('gulp-header');
var merge = require('merge-stream');
var eslint = require('gulp-eslint');
var gulpsync = require('gulp-sync')(gulp);
var pkg = require('./package.json');

var banner = [
    '/**',
    ' * @fileoverview ${name}',
    ' * @author ${author}',
    ' * @version ${version}',
    ' * @license ${license}',
    ' * @link ${repository.url}',
    ' */',
    ''
].join('\n');

gulp.task('browserify', function() {
    var b = browserify('src/js/chart.js', {debug: true});
    b.add('./src/js/plugins/pluginRaphael.js');
    b.transform(stringify(['.html']));

    return b.bundle()
        .pipe(source('chart.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compile-less', function() {
    return gulp.src('src/less/style.less')
        .pipe(less())
        .pipe(rename('chart.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['browserify', 'compile-less'], function() {
    gulp.watch('src/js/**/*', ['browserify']);
    gulp.watch('src/less/**/*', ['compile-less']);
});

gulp.task('compress-js', ['browserify'], function() {
    return gulp.src('dist/chart.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(header(banner, pkg))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', ['compile-less'], function() {
    return gulp.src('dist/chart.css')
        .pipe(minifiyCss({compatibility: 'ie7'}))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(header(banner, pkg))
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean-samples', function(callback) {
    del([
        'dist/chart.min.js',
        'dist/chart.min.css',
        'samples/dist/*',
        'samples/lib/*'
    ], callback);
});

gulp.task('copy-samples', ['clean-samples', 'compress-js', 'minify-css'], function() {
    return merge(
        gulp.src('maps/*')
            .pipe(gulp.dest('dist/maps'))
            .pipe(gulp.dest('samples/dist/maps')),
        gulp.src(['dist/chart.min.css', 'dist/chart.min.js'])
            .pipe(gulp.dest('samples/dist')),
        gulp.src(['lib/tui-code-snippet/code-snippet.min.js', 'lib/tui-component-effects/effects.min.js', 'lib/raphael/raphael-min.js'])
            .pipe(gulp.dest('samples/lib'))
    );
});

gulp.task('lint', function() {
    return gulp.src(['src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.failOnError());
});

gulp.task('deploy', gulpsync.sync(['lint', 'copy-samples']), function() {
    process.exit(0);
});

gulp.task('default', ['watch']);
