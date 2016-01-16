var config = require('./config');

module.exports = function (r, g, b) {
  // Apply global brightness control here
  r = Math.floor(r * config.globalBrightness);
  g = Math.floor(g * config.globalBrightness);
  b = Math.floor(b * config.globalBrightness);

  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
};
