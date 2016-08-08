var fs = require('fs')
var through = require('through2')
var combineTool = require('magix-combine');

combineTool.config({
  prefix: 'mx',
  tmplFolder: './',
  loaderType: 'cmd'
})

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    combineTool.config({
      tmplFolder: file.cwd
    })
    var jsStr = file.contents.toString(enc)
    if (/define\(.*function\s*\(\s*require\s*(.*)?\)\s*\{/.test(jsStr)) {
      cb(null, file)
    } else {
      combineTool.processContent(file.path, '', jsStr).then(function(content) {
        file.contents = new Buffer(content);
        cb(null, file)
      })
    }
  })
}
