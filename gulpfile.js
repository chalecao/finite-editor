//npm install gulp gulp-less --save-dev
var gulp = require('gulp');
var less = require('gulp-less');


gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist/'))
});

gulp.task('css', function () {
    return gulp.src('src/index.less')
        .pipe(less({
            paths: [__dirname, 'src'],
            relativeUrls: true
        }))
        .pipe(gulp.dest('dist/'))
});
gulp.task('default', [
    'css',
    'html'
]);