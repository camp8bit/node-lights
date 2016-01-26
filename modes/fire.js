var utils = require('../utilities');
var Gradient = require('gradient/lib/gradient.js');

module.exports = function (panel, colors) {
  var h = panel.length;
  var buffer = new Array(panel.length);
  var gradient = Gradient(colors, panel.length);
  var palette = gradient.toArray().map(function (c) {
    return utils.intColor(c);
  }).reverse();

  var i, j;

  return function (beat, step) {
    for (i = h; i > 0 ; i--) {
      buffer[i] = buffer[i - 1] * 0.98;
    }

    // Random sparks
    for (j = 0; j < 1; j++) {
      i = Math.floor(Math.random() * 15);
      buffer[i] = Math.random();
    }

    // Base burning
    buffer[0] = Math.random() * 0.5 + 0.5;

    for (i = 0; i < h; i++) {
      panel.pixelData[i + panel.start] = palette[Math.floor(buffer[i] * h)];
      // pixelData[i] = utils.rgb2Int(buffer[offset] * 255, 0, 0)
    }
  };
};
