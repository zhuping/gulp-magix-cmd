var gulp = require('gulp')
var combine = require('../index')

gulp.task('js', function() {
  gulp.src('./app/*.js')
    .pipe(combine({
      base: './app'
    }))
    .pipe(gulp.dest('./dist'))
})
