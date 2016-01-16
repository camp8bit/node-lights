var rgbToInt = require('./rgb-to-int');

// rainbow-colors, taken from http://goo.gl/Cs3H0v
module.exports = function (pos) {
  pos = 255 - pos;

  if (pos < 85) {
    return rgbToInt(255 - pos * 3, 0, pos * 3);
  } else if (pos < 170) {
    pos -= 85;
    return rgbToInt(0, pos * 3, 255 - pos * 3);
  } else {
    pos -= 170;
    return rgbToInt(pos * 3, 255 - pos * 3, 0);
  }

  throw 'Invalid pos ' + pos;
};
