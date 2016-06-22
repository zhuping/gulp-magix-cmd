var fs = require('fs')
var Path = require('path')
var through = require('through2')
var gutil = require('gulp-util')

var PluginError = gutil.PluginError

var fileTmplReg = /\b(\w+)\s*:([\s\S]*?)(['"])@([^'"]+)(?:\3)/g
var defineTmpl = "define('@name', [@require], function(require, exports, module){\n\n@code\n\n})"
var depsReg = /(?:var\s+([^=]+)=\s*)?require\(([^\(\)]+)\);?/g
var htmlCommentCelanReg = /<!--[\s\S]*?-->/g
var htmlTagCleanReg = />\s+</g
var cssCleanReg = /\s*([;\{\}:,])\s*/g

function parsePath(path) {
  var extname = Path.extname(path)

  return {
    dirname: Path.dirname(path),
    basename: Path.basename(path, extname),
    extname: extname
  };
}

function transform(source, from, deps) {
  if (!/define\(.*function\s*\(\s*require\s*(.*)?\)\s*\{/.test(source)) {
    source = defineTmpl.replace('@code', function() {
      return source
    })
    .replace('@name', from)
    .replace('@require', deps)

    return source
  }
}

function compileView(from, source) {
  return source.replace(fileTmplReg, function(match, key, fill, quote, name) {
    var head = key + ':',
      tail = '.html'
    if (key == 'css') {
      tail = '.css'
    }
    var file = Path.dirname(from) + Path.sep + name + tail
    var content = name
    if (fs.existsSync(file)) {
      content = fs.readFileSync(file) + ''
      if (key == 'css') {
        content = content.replace(cssCleanReg, '$1')
      } else {
        content = content.replace(htmlCommentCelanReg, '').replace(htmlTagCleanReg, '><')
      }
      content = JSON.stringify(content)
    }
    return head + fill + content
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
    var deps = []

    // 合并html
    jsStr = compileView(Path.join(file.base, file.relative), jsStr)

    // 提取依赖
    jsStr = jsStr.replace(depsReg, function(match, key, str) {
      deps.push(str)
      return match
    })

    if (deps.length) {
      deps = deps.join(',')
    }

    // 包装成cmd规范
    contents = transform(jsStr, Path.join(options.base, parsedPath.dirname, parsedPath.basename), deps)

    if (contents) {
      file.contents = new Buffer(contents)
    }

    cb(null, file)

  })
}
