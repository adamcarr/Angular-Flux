var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserSync = require('browser-sync').create();

gulp.task('ts', function () {
    var tsProject = ts.createProject('app/tsconfig.json');
    var tsResult = tsProject.src()
        .pipe(ts(tsProject));
        
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });
    
    gulp.watch('app/**/*.ts', ['ts',  browserSync.reload]);
    gulp.watch('index.html').on('change', browserSync.reload);
});

gulp.task('default', ['ts', 'browser-sync']);