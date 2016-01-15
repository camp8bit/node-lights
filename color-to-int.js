var rgbToInt = require('./rgb-to-int');

module.exports = function (color) {
  return rgbToInt(color.red(), color.green(), color.blue());
};
