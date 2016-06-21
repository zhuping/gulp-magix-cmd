define('app/index', function(require, exports, module){

var Magix = require('magix')

module.exports = Magix.View.extend({
  tmpl: "<div>hello world!</div>\n",
  render: function() {

    // render view
  }
})


})