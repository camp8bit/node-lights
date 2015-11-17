var utils = require('../utilities')
var Gradient = require('gradient/lib/gradient.js')

module.exports = function (h) {
  var buffer = new Array(h)
  var gradient = Gradient('#ffffff', '#ffff00', '#ff0000', '#000000', h)
  var palette = gradient.toArray().map(function (c) {
    return utils.intColor(c)
  }).reverse()

  var i, j

  return function (beat, step, pixelData) {
    for (i = h; i > 0 ; i--) {
      buffer[i] = buffer[i - 1] * 0.95
    }

    // Random sparks
    if (step === 0) {
      for (j = 0; j < 10; j++) {
        i = Math.floor(Math.random() * 40)
        buffer[i] = 1.0
      }
    }

    // Base burning
    buffer[0] = Math.random() * 0.2

    for (i = 0; i < pixelData.length; i++) {
      var offset = Math.floor(buffer.length / h * i)

      pixelData[i] = palette[Math.floor(buffer[offset] * h)]
      // pixelData[i] = utils.rgb2Int(buffer[offset] * 255, 0, 0)
    }
  }
}
