/// <reference path="typings/node/node.d.ts"/>

var fs = require('fs'), 
    gulp = require('gulp'),
    globby = require('globby'),
    connect = require('gulp-connect');

var exec = require('child_process').exec;

// gulp.task('default', ['sync', 'build-watch']);

gulp.task('sync', function(callback) {
    var tsConfig = require('./tsconfig.json');
    
    globby(tsConfig.filesGlob).then(function(matches) {
        
        tsConfig.files = matches;
        fs.writeFile('tsconfig.json', JSON.stringify(tsConfig, null, '    ') + '\n', callback);
    });
});

gulp.task('build', function (callback) {
    build(callback, false);
});

gulp.task('build-watch', function (callback) {
    build(callback, true);
});

function build(callback, watch) {
    var command = 'tsc';
    
    if (watch) {
        command += ' -w';
    }
    
    var cp = exec(command, callback);
    
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stdout);
}

gulp.task('test', function (callback) {
    
    var cp = exec('mocha bin/test/test.js', callback);
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stdout);
});

gulp.task('connect', function() {
    connect.server({
        root: 'example',
        livereload: true
    });
});
 
gulp.task('live-front-end', function () {
    gulp.src('./example/*.*')
        .pipe(connect.reload());
});
 
gulp.task('watch', function () {
    var cp = exec('tsc -w');
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stdout);
    gulp.watch(['./example/*.*'], ['live-front-end']);
});
 
gulp.task('default', ['connect', 'watch']);
