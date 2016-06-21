var fs = require('fs')
var Path = require('path')
var through = require('through2')
var gutil = require('gulp-util')

var PluginError = gutil.PluginError

var fileTmplReg = /\b(\w+)\s*:([\s\S]*?)(['"])@([^'"]+)(?:\3)/g
var defineTmpl = "define('@name', function(require, exports, module){\n\n@code\n\n})"

function parsePath(path) {
  var extname = Path.extname(path)

  return {
    dirname: Path.dirname(path),
    basename: Path.basename(path, extname),
    extname: extname
  };
}

function transform(source, from) {
  if (!/define\(.*function\s*\(\s*require\s*(.*)?\)\s*\{/.test(source)) {
    source = defineTmpl.replace('@code', function() {
      return source
    }).replace('@name', from)
    return source
  }
}

function compileView(from, source) {
  return source.replace(fileTmplReg, function(match, key, fill, quote, name) {
    var head = key + ':',
      tail = '.html'
    var file = Path.dirname(from) + Path.sep + name + tail
    var content = name
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file).toString()
      content = JSON.stringify(content)
      return head + fill + content
    } else {
      return match
    }
  })
}

module.exports = function(options) {
  options = options || {}

  // if (options.base) {
  //   options.base = Path.resolve(options.base, '.') + '/';
  // }

  return through.obj(function(file, enc, cb) {
    var jsStr = file.contents.toString(enc)
    var parsedPath = parsePath(file.relative)
    var contents = ''

    // 合并html
    jsStr = compileView(Path.join(file.base, file.relative), jsStr)

    // 包装成cmd规范
    contents = transform(jsStr, Path.join(options.base, parsedPath.dirname, parsedPath.basename))

    if (contents) {
      file.contents = new Buffer(contents)
    }

    cb(null, file)

  })
}
