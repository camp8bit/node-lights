var Color = require('color');
var config = require('./config');
var colorToInt = require('./color-to-int');

var PULSE_LENGTH = 10;

function Panel (pixelData, start, stop) {
  if (stop < start) {
    throw new Error('Stop before start');
  }

  this.start = start;
  this.stop = stop;
  this.length = stop - start;
  this.pixelData = pixelData;
  this.color = Color('red');
}

Panel.prototype.on = function (beat, step) {
  for (var i = this.start; i < this.end; i++) {
    this.pixels.set(i, this.color);
  }
};

Panel.prototype.clear = function () {
  this.fill(0, this.length, Color('black'));
};

Panel.prototype.fill = function (a, b, color) {
  a = Math.max(a, 0);
  b = Math.min(b, this.length);
  color = colorToInt(color);

  for (var i = a + this.start; i < b + this.start; i++) {
    this.pixelData[i] = color;
  }
};

Panel.prototype.wipeUp = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * step;
  this.fill(0, length, this.color);
};

Panel.prototype.wipeDown = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * step;
  this.fill(length, this.length, this.color);
};

Panel.prototype.wipeIn = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * step / 2;
  this.fill(length, this.length - length, this.color);
};

Panel.prototype.wipeOut = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * (config.stepsPerBeat - step) / 2;
  this.fill(length, this.length - length, this.color);
};

Panel.prototype.pulseUp = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * step;
  this.pixels.fill(length, length + PULSE_LENGTH, this.color);
};

Panel.prototype.pulseDown = function (beat, step) {
  this.clear();

  var length = this.length / config.stepsPerBeat * (config.stepsPerBeat - step);
  this.pixels.fill(length, length + PULSE_LENGTH, this.color);
};

module.exports = Panel;
