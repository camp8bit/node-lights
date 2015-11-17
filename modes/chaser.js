var utils = require('../utilities')
// var Gradient = require('gradient/lib/gradient.js')
var Color = require('color')

module.exports = function (h) {
  // var gradient = Gradient('#ff0000', '#00ff00', '#0000ff', h)
  // var palette = gradient.toArray().map(function (c) {
  //   return utils.intColor(c)
  // }).reverse()

  var Green = utils.intColor(Color('#00ff00'))
  var Black = utils.intColor(Color('#000000'))
  var x = 0
  var length = 20

  return function (beat, step, pixelData) {
    var h = pixelData.length

    x += 0.02

    var o = Math.floor((Math.sin(x) / 2 + 0.5) * length)

    for (var i = 0; i < h; i++) {
      var b = i % length === o
      
      pixelData[i] = b ? Green : Black
    }
  }
}
