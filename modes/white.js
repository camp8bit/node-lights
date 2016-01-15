var utils = require('../utilities')
var Color = require('color')

module.exports = function (h) {
  var white = utils.intColor(Color('#ffffff'));
  var black = utils.intColor(Color('#000000'));

  return function (beat, step, pixelData) {
    var h = pixelData.length

    for (var i = 0; i < h; i++) {
      pixelData[i] = step === 0 ? white : black;
    }
  }
}
