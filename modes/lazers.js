var utils = require('../utilities')
var Color = require('color')

module.exports = function (h) {
  var palette

  // http://www.colourlovers.com/palette/1542940/400_Laser_B_e_a_m_s
  palette = '#1F0824 #692342 #FB174C #F1503A #CFFE3C'

  // http://www.colourlovers.com/palette/1834579/Goats_N_Lasers
  palette = '#9BFD24 #FD247F'

  // http://www.colourlovers.com/palette/7315/Pop_Is_Everything
  palette = '#AAFF00 #FFAA00 #FF00AA #AA00FF #00AAFF'
  
  var colors = palette.split(' ').map(function (c) {
    return utils.intColor(Color(c))
  })

  var black = utils.intColor(Color('#000000'))
  var index = 0

  return function (beat, step, pixelData) {
    var h = pixelData.length

    if (step === 0) {
      index = (index + 1) % colors.length
    }

    for (var i = 0; i < h; i++) {
      pixelData[i] = step === 0 ? colors[index] : black
    }
  }
}
