var Magix = require('magix')

Magix.applyStyle('@index.css')

module.exports = Magix.View.extend({
  tmpl: '@index.html',
  render: function() {

    // render view
  }
})
