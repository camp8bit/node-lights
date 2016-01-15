var utils = require('../utilities')
var Color = require('color')
var Gradient = require('gradient/lib/gradient.js')

module.exports = function (h) {
  var gradient = Gradient('#00ffaa', '#00ff00', '#005500', '#000000', h)
  
  gradient = Gradient('#ff0000', '#00ff00', '#0000ff', h)
  
  var palette = gradient.toArray().map(function (c) {
    return utils.intColor(c)
  }).reverse()

  var black = utils.intColor(Color('#000000'))
  var x = 0

  return function (beat, step, pixelData) {
    var h = pixelData.length

    x += 0.1

    var o = h / 8 * step

    for (var i = 0; i < h; i++) {
      var b = i > o

      pixelData[i] = b ? palette[i] : black
    }
  }
}
