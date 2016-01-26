var udp = require('dgram');
var osc = require('osc-min');
var Color = require('color');
var config = require('./config');
var ws281x;

if (process.getuid() === 0) {
  ws281x = require('rpi-ws281x-native');
} else {
  console.log('Warning running in test mode with no ws281x enabled.');

  ws281x = {
    init: function () {},
    reset: function () {},
    render: function () {}
  };
}

var addresses = {
  tap: '/tap',
  mode: '/modes',
  hue: '/hue',
  brightness: '/brightness',
  all: '/all'
};

var Panel = require('./panel');
var config = require('./config');

var PANEL_LENGTH = 44;

var NUM_LEDS = parseInt(process.argv[2], 10) || (PANEL_LENGTH * 4); // 60 * 5
var pixelData = new Uint32Array(NUM_LEDS);
var inport;

// Patterns of beams to turn on.  It's a bitmask:
// Bits 1-4 (least-significant) each reference a beam
// Bits 5-6 reference a pattern number (0,1,2,3) so you can have up to 4 different colour patterns in a sequence

var beatPatterns = [
  ['000001', '000010', '000100', '001000', '000001', '000010', '000100', '001000'],
  ['000001', '000010', '000100', '001000', '000001', '000010', '000100', '001000'],
  ['000001', '011010', '000010', '010101', '000100', '011010', '001000', '010101'],
  ['000001', '000011', '000111', '001111', '011000', '011100', '011110', '011111'],
  ['000011', '001100', '000011', '001100', '010110', '011001', '010110', '011001'],
  ['001111', '001111', '011111', '011111', '101111', '101111', '111111', '111111'],
  ['000001', '010010', '100100', '111000', '000001', '010010', '100100', '111000']
];

if (process.argv[2]) {
  inport = parseInt(process.argv[2], 10);
} else {
  inport = 8000;
}

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

console.log('Press <ctrl>+C to exit.');

function getTime () {
  var t = process.hrtime();
  return t[0] + t[1] / 1e9;
}

var RESET_TIME = 2.0;

var state = new State();

function State () {
  this.firstTap = 0;
  this.lastTap = 0;
  this.tapCount = 0;
  this.bpm = 120;

  this.beatPattern = beatPatterns[0];
  this.mode = 0;
  this.hue = 0;
  this.brightness = 1.0;
  this.all = false;
  this.randomMode = 5;

  this.lastBeat = 0;
  this.beat = 0;
  this.step = 0;
};

State.prototype.tap = function () {
  var t = getTime();

  if (t - this.lastTap > RESET_TIME) {
    this.firstTap = t;
    this.lastTap = t;
    this.tapCount = 0;
  } else {
    this.lastTap = t;
    this.tapCount++;
  }

  if (this.tapCount > 1) {
    var secondsPerBeat = (this.lastTap - this.firstTap) / parseFloat(this.tapCount);
    this.bpm = Math.round(1.0 / (secondsPerBeat / 60.0));
    console.log(this.bpm);

    this.barChanged();
  }
};

State.prototype.nextMode = function () {
  this.mode = (this.mode + 1) % Panel.modes.length;
};

State.prototype.getModeName = function () {
  var m;

  if (this.mode === 0) {
    m = this.randomMode;
  } else {
    m = this.mode;
  }

  return Panel.modes[m] || 'pulseUp';
};

State.prototype.randomColor = function () {
  return Color().hsv(Math.floor(Math.random () * 255), 255, 255);
};

State.prototype.beatChanged = function () {
};

State.prototype.barChanged = function () {
  var i = Math.min(beatPatterns.length - 1, Math.floor(Math.random() * beatPatterns.length));
  this.beatPattern = beatPatterns[i];
  this.randomMode = Math.floor(Math.random() * 6) + 5;
  this.color = this.randomColor();
  console.log('bar changed');
};

State.prototype.update = function (t) {
  var dT = t - this.lastTap;
  var dBeats = dT / (60.0 / this.bpm);
  var beat = dBeats % config.beatsPerBar;
  this.step = Math.floor(beat * config.stepsPerBeat) % config.stepsPerBeat;
  beat = Math.floor(beat);

  if (beat !== this.beat) {
    this.beatChanged();

    if (beat === 0) {
      this.barChanged();
    }
  }

  this.beat = beat;
};

State.prototype.getActivePanels = function () {
  var self = this;
  var result = [];
  var beatPattern = this.beatPattern[this.beat].slice(2, this.panels.length + 2).split('');
  var i;

  if (this.all) {
    for (i = 0; i < this.panels.length; i++) {
      result.push(self.panels[i]);
    }
    return result;
  }

  for (i = 0; i < this.panels.length; i++) {
    if (beatPattern[i] === '1') {
      result.push(self.panels[i]);
    }
  }

  return result;
};

var state = new State();

state.panels = [
  new Panel(pixelData, PANEL_LENGTH * 0, PANEL_LENGTH * 1 - 1, true),
  new Panel(pixelData, PANEL_LENGTH * 1, PANEL_LENGTH * 2 - 1, false),
  new Panel(pixelData, PANEL_LENGTH * 2, PANEL_LENGTH * 3 - 1, true),
  new Panel(pixelData, PANEL_LENGTH * 3, PANEL_LENGTH * 4 - 1, false)
];

setInterval(function () {
  state.update(getTime());

  // console.log('\n\n>> New frame\n\n');

  state.panels.forEach(function (panel) {
    panel.clear();
  });

  try {
    state.getActivePanels().forEach(function (panel) {
      panel.color = state.color;
      panel[state.getModeName()].apply(panel, [state.beat, state.step]);

      if (panel.inverted) {
        panel.flip();
      }
    });
  } catch (e) {
    console.log(state.getModeName());
    console.log(state.mode);
    console.error(e);
  }

  ws281x.render(pixelData);
}, 10);

var sock = udp.createSocket('udp4', function (msg, rinfo) {
  var message;

  try {
    message = osc.fromBuffer(msg);
  } catch (_error) {
    console.log('invalid OSC packet');
    return;
  }

  var push = message.args && message.args[0] && message.args[0].value === 1;

  if (push && (message.address === addresses.tap)) {
    state.tap();
  }

  if (message.address === addresses.all) {
    state.all = message.args[0].value === 1;
  }

  if (message.address === addresses.hue) {
    state.hue = message.args[0].value;
    state.color = Color().hsv(Math.floor(state.hue * 255), 255, 255);
  }

  if (message.address === addresses.brightness) {
    state.brightness = message.args[0].value;
    config.globalBrightness = state.brightness;
  }

  if ((push) && (message.address.match('/modes'))) {
    var y = message.address.split('/')[2] - 1;
    var x = message.address.split('/')[3] - 1;
    var i = y * 3 + x;
    state.mode = i;
  }
});

sock.bind(inport);
