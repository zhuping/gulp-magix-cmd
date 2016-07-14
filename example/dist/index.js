define('app/index',['magix'],function(require,exports,module){
/*Magix */
var Magix = require('magix')

Magix.applyStyle('mx6e2',"body{background-color:red}")

module.exports = Magix.View.extend({
  tmpl: "<div>hello world!</div>",
  render: function() {

    // render view
  }
})

});