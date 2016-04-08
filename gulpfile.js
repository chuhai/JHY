var gulp = require('gulp'),
		uglify = require('gulp-uglify');

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
  gulp.src('./frontend/js/jun.js')
  		.pipe(uglify())
  		.pipe(gulp.dest('./frontend/onlinejs'));
});

// // 看守
// gulp.task('watch', function() {
 
//   // 看守所有.js档
//   gulp.watch('./js/*.js', ['default']);
 
//   // 看守所有图片档
//   gulp.watch('src/images/**/*', ['images']);
 
 
// });