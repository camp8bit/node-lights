var Fire = require('./modes/fire');

var Color = require('color');
var config = require('./config');
var colorToInt = require('./color-to-int');

var PULSE_LENGTH = 10;

function Panel (pixelData, start, stop, inverted) {
  if (stop < start) {
    throw new Error('Stop before start');
  }

  this.start = start;
  this.stop = stop;
  this.length = stop - start + 1;
  this.pixelData = pixelData;
  this.color = Color('red');
  this.inverted = inverted;
  this.strobeCounter = 0;

  this.fire = Fire(this);
}

Panel.modes = 'random fire wipeUp wipeDown wipeIn wipeOut pulseUp pulseDown strobe'.split(' ');

Panel.prototype.on = function (beat, step) {
  for (var i = this.start; i < this.end; i++) {
    this.pixels.set(i, this.color);
  }
};

Panel.prototype.clear = function () {
  this.fill(0, this.length, Color('black'));
};

Panel.prototype.flip = function () {
  var i;

  for (i = 0;i < this.length / 2;i++) {
    var a = this.pixelData[i + this.start] + 0;
    var b = this.pixelData[this.stop - i] + 0;

    this.pixelData[i + this.start] = b;
    this.pixelData[this.stop - i] = a;
  }
};

Panel.prototype.fill = function (a, b, color) {
  a = Math.max(Math.floor(a), 0);
  b = Math.min(Math.floor(b), this.length);
  var c;

  if (color.red) {
    c = colorToInt(color);
  } else {
    c = color;
  }

  for (var i = a + this.start; i < b + this.start; i++) {
    this.pixelData[i] = c;
  }
};

Panel.prototype.random = function (beat, step) {
  var length = this.length / config.stepsPerBeat * step;
  this.fill(0, length, this.color);
};

Panel.prototype.wipeUp = function (beat, step) {
  var length = this.length / config.stepsPerBeat * step;
  this.fill(0, length, this.color);
};

Panel.prototype.wipeDown = function (beat, step) {
  var length = this.length / config.stepsPerBeat * step;
  this.fill(length, this.length, this.color);
};

Panel.prototype.wipeIn = function (beat, step) {
  var length = this.length / config.stepsPerBeat * step / 2;
  this.fill(length, this.length - length, this.color);
};

Panel.prototype.wipeOut = function (beat, step) {
  var length = this.length / config.stepsPerBeat * (config.stepsPerBeat - step) / 2;
  this.fill(length, this.length - length, this.color);
};

Panel.prototype.pulseUp = function (beat, step) {
  var length = this.length / config.stepsPerBeat * step;
  this.fill(length, length + PULSE_LENGTH, this.color);
};

Panel.prototype.pulseDown = function (beat, step) {
  var length = this.length / config.stepsPerBeat * (config.stepsPerBeat - step);
  this.fill(length, length + PULSE_LENGTH, this.color);
};

Panel.prototype.strobe = function (beat, step) {
  if (this.strobeCounter % 4 === 0) {
    this.fill(0, this.length, Color('white'));
  }

  this.strobeCounter++;
};

module.exports = Panel;
