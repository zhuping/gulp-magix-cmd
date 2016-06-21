# gulp-magix-cmd

合并 `magix` 项目中对应的 `.html` 和 `.js` 文件，同时把该文件包装成 `cmd` 规范。

### Usage

```js
var combine = require('gulp-magix-cmd')

gulp.task('combine', function() {
  gulp.src('./app/*.js')
    .pipe(combine({
      base: 'app/'
    }))
})
```
