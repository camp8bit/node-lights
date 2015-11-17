var utils = require('../utilities')
var Gradient = require('gradient/lib/gradient.js')

module.exports = function (h) {
  var gradient = Gradient('#ff0000', '#00ff00', '#0000ff', h)
  var palette = gradient.toArray().map(function (c) {
    return utils.intColor(c)
  }).reverse()

  var x = 0

  return function (beat, step, pixelData) {
    var h = pixelData.length

    x += 0.01

    for (var i = 0; i < h; i++) {
      var j = Math.sin(x + Math.PI / h * i + beat + step / 13) / 2 + 0.5

      pixelData[i] = palette[Math.floor(j * h)]
    }
  }
}
