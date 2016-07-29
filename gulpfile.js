'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var stringify = require('stringify');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifiyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var header = require('gulp-header');
var streamify = require('gulp-streamify');
var merge = require('merge-stream');
var gulpsync = require('gulp-sync')(gulp);
var del = require('del');
var eslint = require('gulp-eslint');
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

var PATH_DIST = 'dist/';
var PATH_BUILD = 'build/';
var PATH_SAMPLES = 'samples/';
var PATH_LIB = 'lib/';
var PATH_MAPS = 'maps/';

function bundle(debug) {
    var b = browserify('src/js/chart.js', {debug: debug});
    b.add('src/js/plugins/pluginRaphael.js');
    b.transform(stringify(['.html']));

    return b.bundle()
        .pipe(source('chart.js'));
}

function complieLess() {
    return gulp.src('src/less/style.less')
        .pipe(less())
        .pipe(rename('chart.css'));
}

gulp.task('build-js', function() {
    return bundle(true)
        .pipe(gulp.dest(PATH_BUILD));
});

gulp.task('build-css', function() {
    return complieLess()
        .pipe(gulp.dest(PATH_BUILD));
});

gulp.task('build', ['build-js', 'build-css'], function() {
    gulp.watch('src/js/**/*', ['build-js']);
    gulp.watch('src/less/**/*', ['build-css']);
});

gulp.task('clean', function(callback) {
    del([
        PATH_DIST,
        PATH_SAMPLES + PATH_DIST,
        PATH_SAMPLES + PATH_LIB
    ], callback);
});

gulp.task('deploy-js', ['lint'], function() {
    return bundle(false)
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(streamify(uglify()))
        .pipe(rename({extname: '.min.js'}))
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLES + PATH_DIST));
});

gulp.task('deploy-css', function() {
    return complieLess()
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(minifiyCss({compatibility: 'ie7'}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(streamify(header(banner, pkg)))
        .pipe(gulp.dest(PATH_DIST))
        .pipe(gulp.dest(PATH_SAMPLES + PATH_DIST));
});

gulp.task('copy-files', function() {
    return merge(
        gulp.src(PATH_MAPS + '*')
            .pipe(gulp.dest(PATH_DIST + PATH_MAPS))
            .pipe(gulp.dest(PATH_SAMPLES + PATH_DIST + PATH_MAPS)),
        gulp.src([
            PATH_LIB + 'tui-code-snippet/code-snippet.min.js',
            PATH_LIB + 'tui-component-effects/effects.min.js',
            PATH_LIB + 'raphael/raphael-min.js'])
            .pipe(gulp.dest(PATH_SAMPLES + PATH_LIB))
    );
});

gulp.task('lint', function() {
    return gulp.src(['src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.failAfterError());
});

gulp.task('deploy', gulpsync.sync(['clean', 'deploy-js', 'deploy-css', 'copy-files']));

gulp.task('default', ['build']);
