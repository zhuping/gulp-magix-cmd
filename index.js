var fs = require('fs')
var through = require('through2')

var combineTool = require('magix-combine');

var wrapTMPL = 'define(\'${moduleId}\',[${requires}],function(require,exports,module){\r\n/*${vars}*/\r\n${content}\r\n});';
var wrapNoDepsTMPL = 'define(\'${moduleId}\',function(require,exports,module){\r\n${content}\r\n});';

combineTool.config({
  prefix: 'mx',
  generateJSFile: function(o) {
    var tmpl = o.requires.length ? wrapTMPL : wrapNoDepsTMPL;
    for (var p in o) {
      var reg = new RegExp('\\$\\{' + p + '\\}', 'g');
      tmpl = tmpl.replace(reg, (o[p] + '').replace(/\$/g, '$$$$'));
    }
    return tmpl;
  }
});
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
        //console.log(c);
        file.contents = new Buffer(content);
        cb(null, file);
      });
    }
  })
}
